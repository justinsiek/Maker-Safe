from typing import ClassVar, Mapping, Optional, Sequence, Tuple
import json
import urllib.request

from viam.proto.app.robot import ComponentConfig
from viam.proto.common import ResourceName
from viam.resource.base import ResourceBase
from viam.resource.easy_resource import EasyResource
from viam.resource.types import Model, ModelFamily
from viam.services.generic import Generic
from viam.utils import ValueTypes


class GenericService(Generic, EasyResource):
    MODEL: ClassVar[Model] = Model(
        ModelFamily("ce2f6138-e07a-4d32-b40b-0bf206fbf301", "justin-login"),
        "generic-service",
    )

    @classmethod
    def validate_config(
        cls, config: ComponentConfig
    ) -> Tuple[Sequence[str], Sequence[str]]:
        return [], []

    @classmethod
    def new(
        cls, config: ComponentConfig, dependencies: Mapping[ResourceName, ResourceBase]
    ) -> "GenericService":
        return cls(config.name)

    async def do_command(
        self,
        command: Mapping[str, ValueTypes],
        *,
        timeout: Optional[float] = None,
        **kwargs
    ) -> Mapping[str, ValueTypes]:
        url = "http://10.112.85.14:8080/login/"

        payload = {"external_label": "67"}
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
