import os.path
import time
import warnings
from typing import List, SupportsFloat, Any, Tuple, Dict, Union
from ..types import BrowserEvent, ResetOptions

import requests
import json

import gymnasium as gym
from gymnasium.core import ObsType

import voyager.utils as U

from .process_monitor import SubprocessMonitor


class VoyagerEnv(gym.Env):
    def __init__(
        self,
        server_host="http://127.0.0.1",
        server_port=3000,
        request_timeout=600,
        log_path="./logs",
    ):  
        self.server = f"{server_host}:{server_port}"
        self.server_port = server_port
        self.request_timeout = request_timeout
        self.log_path = log_path
        self.has_reset = False
        self.reset_options: Union[ResetOptions, None] = None
        self.connected = False
        # self.browser_instance = self.run(server_port)

    def run(self, server_port):
        U.f_mkdir(self.log_path, "browser")
        file_path = os.path.abspath(os.path.dirname(__file__))
        monitor = SubprocessMonitor(
            commands=[
                "node",
                U.f_join(file_path, "browser/index.js"),
                # TODO
                # str(server_port),
            ],
            name="browser",
            log_path=U.f_join(self.log_path, "browser"),
        )
        monitor.run()
        return monitor

    def check_process(self):
        if self.browser_instance and not self.browser_instance.is_running:
            raise RuntimeError("Browser process has been terminated")

    def step(
        self,
        code: str = "",
        programs: str = "",
    ) -> List[BrowserEvent]:
        if not self.has_reset:
            raise RuntimeError("Environment has not been reset yet")
        # self.check_process()
        data = {
            "code": code,
            "programs": programs,
        }
        res = requests.post(
            f"{self.server}/execute", json=data, timeout=self.request_timeout
        )
        if res.status_code != 200:
            raise RuntimeError("Failed to execute NodeJS code")
        returned_data = res.json()
        return returned_data["events"]

    def render(self):
        raise NotImplementedError("render is not implemented")

    def reset(
        self,
        *,
        options: ResetOptions = {
            "clickables": {},
            "currentUrl": "",
            "workspace": [],
            "text": ""
        },
    ):

        self.reset_options = options
        self.has_reset = True
        self.connected = True

    def close(self):
        # if self.browser_instance:
        #     self.browser_instance.stop()
        return not self.connected