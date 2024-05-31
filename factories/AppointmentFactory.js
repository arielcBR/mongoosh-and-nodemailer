class AppointmentFactory {
  
  Build(simpleAppointment) {
    const day = simpleAppointment.date.getDate() + 1
    const month = simpleAppointment.date.getMonth()
    const year = simpleAppointment.date.getFullYear()

    
    const hour = Number.parseInt(simpleAppointment.time.split(':')[0])
    const minutes = Number.parseInt(simpleAppointment.time.split(':')[1])
    
    const startDate = new Date(year, month, day, hour, minutes, 0, 0)
    
    const appointment = {
      id: simpleAppointment._id,
      title: `${simpleAppointment.name} - ${simpleAppointment.description}`,
      start: startDate,
      end: startDate,
      notified: simpleAppointment.notified,
      email: simpleAppointment.email
    }

    return appointment
  }
}

module.exports = new AppointmentFactory()