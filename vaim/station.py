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

class GenericService(Generic, EasyResource):
    MODEL: ClassVar[Model] = Model(
        ModelFamily("ce2f6138-e07a-4d32-b40b-0bf206fbf301", "station"),
        "generic-service",
    ) 
    
    vision: VisionClient
    @classmethod
    def validate_config(
        cls, config: ComponentConfig
    ) -> Tuple[Sequence[str], Sequence[str]]:
        return ["vision-2"], [] #just put vision-1 as the required dependency

    @classmethod
    def new(
        cls, config: ComponentConfig, dependencies: Mapping[ResourceName, ResourceBase]
    ) -> "GenericService":
        self = cls(config.name)
        self.vision = dependencies[VisionClient.get_resource_name("vision-2")] # whole vision object
        return self

    async def do_command(
        self,
        command: Mapping[str, ValueTypes],
        *,
        timeout: Optional[float] = None,
        **kwargs
    ) -> Mapping[str, ValueTypes]:
        LOGGER.error("hello")
        det = await self.vision.get_detections_from_camera("camera-2")
        LOGGER.error(det)
        LOGGER.error(type(det))
        url = "http://10.112.85.14:8080/station/enter"
        if len(det) == 0:
          return {"ok" : False, "error": "No classifications found"}
        first_detection = det[0]
        payload = {
            "external_label": first_detection.class_name, 
            "station_id": "723740fc-d4d8-4990-998c-5660d3e19898"
        }
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
                return {"ok": True, "status": resp.status, "body": body, "sent": payload}
        except Exception as e:
            return {"ok": False, "error": repr(e), "sent": payload, "url": url}
