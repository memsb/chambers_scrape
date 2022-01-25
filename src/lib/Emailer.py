from re import sub
import boto3
from typing import List
from lib.Email import Email
from lib.Subscriber import Subscriber


class Emailer:

    def __init__(self):
        self.client = boto3.client('ses')

    def send(self, email: Email, subscribers: List[Subscriber]):
        response = self.client.send_email(
            Source='schedules@lcmillsconsulting.com',
            Destination={
                'ToAddresses': [subscriber.email for subscriber in subscribers]
            },
            Message={
                'Subject': {
                    'Data': email.get_subject(),
                    'Charset': 'UTF-8'
                },
                'Body': {
                    'Html': {
                        'Data': email.get_content(),
                        'Charset': 'UTF-8'
                    }
                }
            }
        )

        if response["ResponseMetadata"]["HTTPStatusCode"] == 200:
            print("Email sent")
        else:
            print("Unable to send email")
