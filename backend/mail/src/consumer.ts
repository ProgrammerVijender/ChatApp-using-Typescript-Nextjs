import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const startSendOtpConsumer = async () => {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password,
        });

        const channel = await connection.createChannel();
        const queueName = 'send-otp';

        await channel.assertQueue(queueName, { durable: true });
        console.log(`Mail service consumer started`);
        // console.log(" ANKIT  ANKIT  ANKIT  ANKIT  ANKIT  ANKIT  ANKIT  ANKIT  ANKIT  ANKIT  ANKIT ");


        channel.consume(queueName, async (msg) => {
            if (msg) {
                try{
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    
                    console.log(`USERNAME : ${process.env.MAIL_USER} PASSWORD : ${process.env.MAIL_PASSWORD}`)
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465, 
                        // secure: true,
                        auth: {
                            user: process.env.MAIL_USER,
                            pass: process.env.MAIL_PASSWORD,
                        },
                    });

                    transporter.sendMail({
                        from: "Chat App",
                        to,
                        subject,
                        text: body,
                    });

                    console.log(`otp mail sent to ${to}`);
                    channel.ack(msg);

                    // console.log('mail sented')
                }
                catch(err){
                    console.log("Failed to send otp mail : ", err);
                }
            }
        });
    } catch (error) {
        console.error("Failed to send otp mail : ", error);
        process.exit(1);
    }  
}