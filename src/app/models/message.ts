export class Message {
    id: number
    content: string = ''
    timestamp: Date
    userId: number
    projectId: number

    // polja na klientu
    userFullName: string = ''
    date: string = ''
}

export class NewMessage{
    content: string = ''
}