import { templates, select, settings, classNames } from '../settings.js';
import { utils, } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initTableListeners();
    thisBooking.initReservation();
  }

  getData() {
    const thisBooking = this;

    // Przykładowy adres url-rezerwacje z zakresu dat:
    // http://localhost:3131/booking?date_gte=2010-01-01&date_lte=2019-12-31


    // parametry z db.settings

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    // console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);

      }).then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });

  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;


    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1))
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
      }
    }

    // console.log('thisBooking.booked', thisBooking.booked);

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop', hourBlock);


      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {

    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    // zmienna, która oznacza ze wszystkie stoliki są dostępne
    let allAvailable = false;


    if (
      // dla daty nie ma obiektu
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      // dla daty i godziny nie istnieje tablica
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      // czyli żaden stolik nie jest zajęty
      allAvailable = true;
    }


    // iteruje przez wszystkie stoliki na mapie
    for (let table of thisBooking.dom.tables) {
      // pobiera się Id aktualnego stolika
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      // sprawdza czy dataId jest liczbą, nawet jeśli bedzie to ciąg znaków, zmiana typu na liczbę!
      if (!isNaN(tableId)) {
        // konwertujemy ją na liczbę
        tableId = parseInt(tableId);
      }

      // sprawdzenie, czy jest któryś stolik zajęty,
      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        // jeżli zajęty to przypisuje do tablicy
        table.classList.add(classNames.booking.tableBooked);
      } else {
        // to usuwa się klasę  tableBooked
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTableListeners() {
    const thisBooking = this;

    const tables = document.querySelectorAll(select.booking.tables);
    for (let table of tables) {
      table.addEventListener('click', function () {
        if (table.classList.contains('booked')) {
          alert('Ten stolik jest już zajęty!');
        } else {
          const activeTable = document.querySelector(select.booking.tables + '[data-table="' + thisBooking.table + '"]');
          if (activeTable) activeTable.classList.remove('booked');
          table.classList.add('booked');
          thisBooking.table = table.dataset.table;
        }
      });
    }
  }

  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    const payload = {
      id: '',
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: parseInt(thisBooking.table),
      duration: thisBooking.hoursAmount.value,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
      people: thisBooking.peopleAmount.value,
      starters: [],
    };

    for (let starter of thisBooking.dom.starters) {
      if (starter.checked === true) {
        payload.starters.push(starter.value);
      }
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

    thisBooking.getData();
  }


  initReservation() {
    const thisBooking = this;

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = {};
    thisBooking.dom.datePicker.wrapper = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

    thisBooking.dom.hourPicker = {};
    thisBooking.dom.hourPicker.wrapper = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);

  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker.wrapper);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker.wrapper);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }
}
export default Booking;
