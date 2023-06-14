import time

from .file_utils import *
from .json_utils import *


class EventRecorder:
    def __init__(
        self,
        ckpt_dir="ckpt",
        resume=False,
    ):
        self.ckpt_dir = ckpt_dir
        self.iteration = 0
        f_mkdir(self.ckpt_dir, "events")
        if resume:
            self.resume()

    def record(self, events, task):
        task = re.sub(r'[\\/:"*?<>| ]', "_", task)
        task = task.replace(" ", "_") + time.strftime(
            "_%Y%m%d_%H%M%S", time.localtime()
        )
        self.iteration += 1
        dump_json(events, f_join(self.ckpt_dir, "events", task))

    def resume(self, cutoff=None):
        # self.item_history = set()
        # self.item_vs_time = {}
        # self.item_vs_iter = {}
        # self.elapsed_time = 0
        # self.position_history = [[0, 0]]

        # def get_timestamp(string):
        #     timestamp = "_".join(string.split("_")[-2:])
        #     return time.mktime(time.strptime(timestamp, "%Y%m%d_%H%M%S"))

        # records = f_listdir(self.ckpt_dir, "events")
        # sorted_records = sorted(records, key=get_timestamp)
        # for record in sorted_records:
        #     self.iteration += 1
        #     if cutoff and self.iteration > cutoff:
        #         break
        #     events = load_json(f_join(self.ckpt_dir, "events", record))
        #     if not self.init_position:
        #         self.init_position = (
        #             events[0][1]["status"]["position"]["x"],
        #             events[0][1]["status"]["position"]["z"],
        #         )
        #     for event_type, event in events:
        #         self.update_items(event)
        #         self.update_position(event)
        #         if event_type == "observe":
        #             self.update_elapsed_time(event)

        print("Not implemented - resume")
