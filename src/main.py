from appwrite.client import Client
from appwrite.services.users import Users
from appwrite.exception import AppwriteException
import os

def main(context):
    client = (
        Client()
        .set_endpoint(os.environ["APPWRITE_FUNCTION_API_ENDPOINT"])
        .set_project(os.environ["APPWRITE_FUNCTION_PROJECT_ID"])
        .set_key(context.req.headers["x-appwrite-key"])
    )
    users = Users(client)

    try:
        response = users.list()
        context.log("Total users: " + str(response["total"]))
    except AppwriteException as err:
        context.error("Could not list users: " + repr(err))

    if context.req.path == "/ding":
        return context.res.text("Dong")
    if context.req.path == "/ping":
        return context.res.text("Pong")

    return context.res.json(
        {
            "response": " Hello from Appwrite Functions!",
        }
    )
