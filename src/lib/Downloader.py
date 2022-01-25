from typing import List
import os

import requests
from lib.File import File
from lib.PublicationAssets import PublicationAssets
from lib.PdfDetails import PdfDetails


class Downloader:

    def get_files(self, pub: PublicationAssets) -> List[File]:
        output_dir = f"output/pdf/{pub.name}"
        files = [
            self.download_cover_image(pub, output_dir)
        ]
        for file in pub.get_files():
            files.append(self.download_pdf(file, output_dir))

        return files

    def download_cover_image(self, pub: PublicationAssets, dir: str) -> File:
        filename = self.get_filename(pub.coverImage)
        local_path = f"{dir}/{filename}.png"

        return self.download_file(pub.coverImage, local_path)

    def download_pdf(self, file: PdfDetails, dir: str) -> File:
        filename = file.get_filename()
        local_path = f"{dir}/{filename}"

        return self.download_file(file.uri, local_path)

    def get_filename(self, path: str) -> str:
        return os.path.basename(path)

    def download_file(self, url: str, path: str) -> File:
        response = requests.get(url)

        file = File(path)
        file.save_bytes(response.content)

        return file
