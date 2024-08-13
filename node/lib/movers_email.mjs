import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import Handlebars from "handlebars";
import fs from "fs-extra";

export const render_email = async (publicationDescription, movers) => {
    const contents = fs.readFileSync("templates/movers_email.hjs", "utf8");
    const template = Handlebars.compile(contents);

    return template({ description: publicationDescription, movers });
};

export const create_movers_report = async (publicationDescription, movers) => {
    const contents = await render_email(publicationDescription, movers);
    const client = new SESClient({});
    const input = {
        Source: 'schedules@lcmillsconsulting.com',
        Destination: {
            'ToAddresses': ['mbuckley@gmail.com']
        },
        Message: {
            'Subject': {
                'Data': publicationDescription,
                'Charset': 'UTF-8'
            },
            'Body': {
                'Html': {
                    'Data': contents,
                    'Charset': 'UTF-8'
                }
            }
        }
    };

    const command = new SendEmailCommand(input);
    const response = await client.send(command);

    if (response.$metadata.httpStatusCode == 200) {
        console.log("Email sent");
    } else {
        console.log("Unable to send email");
    }
}
