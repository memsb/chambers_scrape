import boto3
from lib.File import File
from lib.Page import Page


class S3:
    def __init__(self, bucket_name: str):
        self.client = boto3.client('s3')
        self.bucket_name = bucket_name

    def upload_page(self, page: Page, destination: str):
        file = page.save()
        self.upload_html(file, destination)

    def upload_html(self, file: File, destination: str):
        self.upload_file(
            file=file,
            destination=destination,
            ExtraArgs={'ContentType': 'text/html'}
        )

    def upload_file(self, file: File, destination: str, ExtraArgs={}):
        self.client.upload_file(
            file.path,
            self.bucket_name,
            f"{destination}/{file.get_filename()}",
            ExtraArgs=ExtraArgs
        )
