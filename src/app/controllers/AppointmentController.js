const moment = require('moment')
const { Op } = require('sequelize')
const { User, Appointment } = require('../models')

class AppointmentController {
  async create (req, res) {
    const provider = await User.findByPk(req.params.provider)
    return res.render('appointments/create', { provider })
  }

  async store (req, res) {
    const { id } = req.session.user
    const { provider } = req.params
    const { date } = req.body

    await Appointment.create({
      user_id: id,
      provider_id: provider,
      date
    })

    return res.redirect('/app/dashboard')
  }

  async index (req, res) {
    const date = moment(new Date())
    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.provider,
        date: {
          [Op.between]: [
            date.startOf('day').format(),
            date.endOf('day').format()
          ]
        }
      },
      include: [{
        model: User, as: 'user'
      }]

    })

    const list = appointments.map(a => {
      return {
        ...a, date: moment(a.date).format('HH:mm')
      }
    })

    return res.render('appointments/list', { list })
  }
}

module.exports = new AppointmentController()
