export function checkIfCanSendTheNotification(endTime: string, startTime: string, eventTime: string){
    const eventTimeDate: Date = new Date(eventTime);
    let hoursEvent: number = eventTimeDate.getUTCHours();
    let minutesEvent: number = eventTimeDate.getUTCMinutes();
    const totalMinutesEvent: number = (hoursEvent * 60) + minutesEvent;
    

    
    let hoursStart: number = parseInt(startTime.substring(0,2),10);
    let minutesStart: number = parseInt(startTime.substring(3,5),10);
    const totalMinutesStart: number = (hoursStart * 60) + minutesStart;

    let hoursEnd: number = parseInt(endTime.substring(0,2),10);
    let minutesEnd: number = parseInt(endTime.substring(3,5),10);
    const totalMinutesEnd: number = (hoursEnd * 60) + minutesEnd;
    console.log(totalMinutesEvent,totalMinutesStart,totalMinutesEnd)


    if (totalMinutesEnd >= totalMinutesStart){ //asume they can be equal and it means dnd lasts one minute
        return totalMinutesEvent < totalMinutesStart || totalMinutesEvent > totalMinutesEnd
    }
    else{
        return !(totalMinutesEvent >= totalMinutesStart || totalMinutesEvent <= totalMinutesEnd)
    }
}