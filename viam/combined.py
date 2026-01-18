from typing import ClassVar, Mapping, Optional, Sequence, Tuple
import json
import urllib.request

from viam.services.vision import VisionClient
from viam.proto.app.robot import ComponentConfig
from viam.proto.common import ResourceName
from viam.resource.base import ResourceBase
from viam.resource.easy_resource import EasyResource
from viam.resource.types import Model, ModelFamily
from viam.services.generic import Generic
from viam.utils import ValueTypes
from viam import logging

LOGGER = logging.getLogger(__name__)

STATION_ID = "ed98c79b-5809-470d-8ac6-e99617eaa2ca"
BASE_URL = "http://10.112.85.14:8080"


class GenericService(Generic, EasyResource):
    MODEL: ClassVar[Model] = Model(
        ModelFamily("my-namespace", "station-double-logic"),
        "generic-service",
    )

    face_vision: VisionClient
    goggles_vision: VisionClient

    @classmethod
    def validate_config(cls, config: ComponentConfig) -> Tuple[Sequence[str], Sequence[str]]:
        # require both vision services
        return ["vision-2", "vision-5"], []

    @classmethod
    def new(
        cls, config: ComponentConfig, dependencies: Mapping[ResourceName, ResourceBase]
    ) -> "GenericService":
        self = cls(config.name)
        self.face_vision = dependencies[VisionClient.get_resource_name("vision-2")]
        self.goggles_vision = dependencies[VisionClient.get_resource_name("vision-5")]
        return self

    def _post_json(
        self,
        url: str,
        payload: Mapping[str, ValueTypes],
        timeout: Optional[float],
    ) -> Mapping[str, ValueTypes]:
        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout or 5) as resp:
                body = resp.read().decode("utf-8", errors="replace")
                return {"ok": True, "status": resp.status, "body": body, "sent": payload, "url": url}
        except Exception as e:
            return {"ok": False, "error": repr(e), "sent": payload, "url": url}

    async def do_command(
        self,
        command: Mapping[str, ValueTypes],
        *,
        timeout: Optional[float] = None,
        **kwargs
    ) -> Mapping[str, ValueTypes]:
        # 1) Face detection (vision-2)
        det = await self.face_vision.get_detections_from_camera("camera-2")

        # If no face -> leave
        if not det:
            return self._post_json(
                f"{BASE_URL}/station/leave",
                {"station_id": STATION_ID},
                timeout,
            )

        # If face -> enter
        first_detection = det[0]
        enter_resp = self._post_json(
            f"{BASE_URL}/station/enter",
            {"external_label": first_detection.class_name, "station_id": STATION_ID},
            timeout,
        )

        # 2) Goggles classification (vision-5)
        # Most classification APIs return a list of classifications with a label/class_name + confidence.
        cls = await self.goggles_vision.get_classifications_from_camera("camera-2", 1)

        # If the model returns nothing, just report it and stop (keeps behavior safe)
        if not cls:
            return {"ok": False, "error": "No goggles classification returned", "enter": enter_resp}

        top = cls[0]
        top_label = getattr(top, "class_name", None) or getattr(top, "label", None)
        top_conf = getattr(top, "confidence", None)

        # Adjust this string check to match your model's actual label names
        goggles_worn = (top_label == "safety_glasses")

        violation_resp = None
        if not goggles_worn:
            violation_resp = self._post_json(
                f"{BASE_URL}/violation/create",
                {
                    "station_id": STATION_ID,
                    "violation_type": "GOGGLES_NOT_WORN",
                },
                timeout,
            )

        return {
            "ok": True,
            "face_detected": True,
            "entered": enter_resp,
            "goggles_classification": {"label": top_label, "confidence": top_conf},
            "violation_sent": violation_resp,
        }
