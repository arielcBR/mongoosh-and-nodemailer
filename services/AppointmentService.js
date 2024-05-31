const mongoose = require('mongoose')
const appointmentSchema = require('../models/Appointment')
const AppointmentFactory = require('../factories/AppointmentFactory')
const nodemailer = require('nodemailer')

const Appointment = mongoose.model('appointment', appointmentSchema)

class AppointmentService {

  async Create(name, email, description, cpf, date, time) {
    const newAppointment = new Appointment({
      name, 
      email, 
      description, 
      cpf, 
      date, 
      time,
      finished: false,
      notified: false
    })

    try {
      await newAppointment.save()
      return true
    } 
    catch (error) {
      console.log(error)
      return false
    }

  }

  async GetAll(showFinished) {
    try {
      if(showFinished){
        return await Appointment.find()
      }
      else{
        const appointments = await Appointment.find({'finished': false})

        const appointmentsFormatted = appointments.map(item => {
          if(item.date != null){
            return AppointmentFactory.Build(item)
          }
        })

        return appointmentsFormatted
      }
    } catch (error) {
      console.log(error)
    }
  }

  async GetById(id) {
    try {
      const event = Appointment.findOne({'_id': id})
      return event
    } catch (error) {
      console.log(error)
    }
  }

  async Finish(id){
    try {
      await Appointment.findOneAndUpdate(id, {finished: true})
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  async Search(query) {
    try {
      const results = await Appointment.find().or([{email: query}, {cpf: query}])
      return results
      
    } catch (error) {
      console.log(error)
      return []
    }
  }

  async SendNotification() {
    const appointments = await this.GetAll(false)

    const transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 25,
      auth: {
        user: '307308fa41baa5',
        pass: '420d7aead727de'
      }
    })

    appointments.forEach(async (item) => {

      const date = item.start.getTime() // data ms ms
      const hour = 1000 * 60 * 60       // 1h in ms
      const gap = date - Date.now()

      if(gap <= hour) {
        if(!item.notified) {

          await Appointment.findByIdAndUpdate(item.id, {notified: true})

          transporter.sendMail({
            from: 'Ariel Campos <ariel@bussiness.com.br>',
            to: item.email,
            subject: 'Sua consulta irá acontecer em breve!',
            text: 'Sua consulta irá acontecer em 1h!'
          })
          .then(() => {

          })
          .catch(error => {
            console.log(error)
          })
        }
      }
    })
  }
}

module.exports = new AppointmentService()