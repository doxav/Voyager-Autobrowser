from voyager import Voyager

openai_api_key = ""

voyager = Voyager(
    openai_api_key=openai_api_key,
)

# start lifelong learning
voyager.learn()