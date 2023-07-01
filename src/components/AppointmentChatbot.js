import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Paper,
  Typography,
  Container,
  Box,
  CssBaseline,
  TextField,
  Button,
  IconButton,
} from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import PersonIcon from '@material-ui/icons/Person';
import AssistantIcon from '@material-ui/icons/Assistant';



const useStyles = makeStyles((theme) => ({
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  chatArea: {
    flexGrow: 1,
    overflowY: 'scroll',
    padding: theme.spacing(2),
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#EFF2F9',
  },
  message: {
    padding: theme.spacing(1, 2),
    borderRadius: '20px',
    margin: theme.spacing(1),
    wordBreak: 'break-word',
    maxWidth: '%',
    backgroundColor: '#FFFFFF',
    color: '#333333',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.05)',
  },
  userMessage: {
    backgroundColor: '#4dabf7',
    color: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#F5F5F5',
    color: '#4D4D4D',
    alignSelf: 'flex-start',
  },
  messageInput: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderTop: '1px solid #E2E5EC',
  },
  inputWrapper: {
    flexGrow: 1,
    marginRight: theme.spacing(1),
    position: 'relative',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(1),
  },
  pillButton: {
    margin: theme.spacing(0.5),
    borderRadius: '20px',
    textTransform: 'none',
    backgroundColor: '#4dabf7',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#2196f3',
    },
  },
  appHeader: {
    backgroundColor: '#FFFFFF',
    color: '#4D4D4D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2, 0),
  },
  appTitle: {
    fontSize: '1.5rem',
  },
}));





const AppointmentChatbot = () => {

  const [date, setDate] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { "type": "bot", "content": "Welcome to HKCC the children's clinic, opposite Ganesha Temple grounds, Kengeri Satelllite Town. Ph: 9538666325", "action": "", "target": "" },
    { "type": "bot", "content": "Please enter your phone number / ದೂರವಾಣಿ ಸಂಖ್ಯೆ.", "action": "", "target": "patientPhone" },
  ]);
  const [selectedAppointment, setSelectedAppointment] = useState({
    language: 'English',
    appointmentDate: '',
    patientPhone: '',
    purpose: 'appointment',
    appointmentTime: '',
    patientName: '',
    status: 'inprogress'
  });
  const [curMessage, setCurMessage] = useState({ "type": "bot", "content": "Welcome to the appointment scheduler. Please enter your phone number", "action": "", "target": "patientPhone" });
  const [sendDisabled, setSendDisabled] = useState(true);
  const classes = useStyles();
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  };


  const getNextTwoDates = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
    const today = new Date();
    const thisHr = today.getHours();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
    if (thisHr < 18) {
      return `${daysOfWeek[today.getDay()]} ${today.getDate()} ${monthsOfYear[today.getMonth()]} ${today.getFullYear()}, ${daysOfWeek[tomorrow.getDay()]} ${tomorrow.getDate()} ${monthsOfYear[tomorrow.getMonth()]} ${tomorrow.getFullYear()}, ${daysOfWeek[dayAfterTomorrow.getDay()]} ${dayAfterTomorrow.getDate()} ${monthsOfYear[dayAfterTomorrow.getMonth()]} ${dayAfterTomorrow.getFullYear()}`;
    } else {
      return `${daysOfWeek[tomorrow.getDay()]} ${tomorrow.getDate()} ${monthsOfYear[tomorrow.getMonth()]} ${tomorrow.getFullYear()}, ${daysOfWeek[dayAfterTomorrow.getDay()]} ${dayAfterTomorrow.getDate()} ${monthsOfYear[dayAfterTomorrow.getMonth()]} ${dayAfterTomorrow.getFullYear()}`;
    }
  };
  
  console.log(getNextTwoDates());
  

  const addMessage = (actor, message) => {
    setMessages((prevMessages) => [...prevMessages, { type: actor, content: message }]);
  }

  const addActionMessage = (actor, message, actions, target) => {
    setMessages((prevMessages) => [...prevMessages, { type: actor, content: message, action: actions, target: target }]);
    setCurMessage({ action: actions, target: target, });
  }

  const handleGetAppointment = async (patientPhone) => {
    try {
      const response = await axios.get(
        `https://h878q1k811.execute-api.us-west-2.amazonaws.com/Prod/appointments/${patientPhone}`
      );
      console.log('FOUND: ' + JSON.stringify(response.data));
      if(new Date(response.data.appointmentDate) > new Date())
      {
        selectedAppointment['appointmentDate'] = response.data.appointmentDate;
        selectedAppointment['appointmentTime'] = response.data.appointmentTime;
        selectedAppointment['status'] = 'scheduled';
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleAction = async (option, target) => {
    // You can add the logic to handle button clicks here.
    console.log('Button clicked:', option);
    addMessage('user', option);
    console.log(selectedAppointment);

    selectedAppointment[target] = option;

    if(target === 'patientPhone')
    {
      if(/^[0-9]{10}$/.test(option))
      {
        await handleGetAppointment(selectedAppointment['patientPhone']);
        console.log('STATUS: ' + JSON.stringify(selectedAppointment));

      }
      else
      {
        selectedAppointment['patientPhone'] = '';
      }

    }



    setCurMessage(null);

    setInput('');

    if (selectedAppointment['language'] === '') {
      addActionMessage('bot', 'What language do you prefer? ನೀವು ಯಾವ ಭಾಷೆಯನ್ನು ಬಳಸಲು ಬಯಸುತ್ತೀರಿ?', 'ಕನ್ನಡ, English', 'language');
    }
    else if (selectedAppointment['patientPhone'] === '') {
      addActionMessage('bot', 'Please enter your phone number / ದೂರವಾಣಿ ಸಂಖ್ಯೆ.', '', 'patientPhone');
    }
    else if (selectedAppointment['patientName'] === '') {
      addActionMessage('bot', 'Please enter the patient\'s name / ರೋಗಿಯ ಹೆಸರು.', '', 'patientName');
    }
    else if (selectedAppointment['purpose'] === '') {
      addActionMessage('bot', 'Do want an Appointment or directions to clinic?', 'appointment, directions to clinic', 'purpose');
    }
    else if (selectedAppointment['appointmentDate'] === '') {
      addActionMessage('bot', 'Select appointment date / ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ದಿನಾಂಕ.', getNextTwoDates(), 'appointmentDate');
    }
    else if (selectedAppointment['appointmentTime'] === '') {
      const curAvailableSlots = await fetchAppointments();
      if (curAvailableSlots) {
        addActionMessage('bot', 'Select appointment time / ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಸಮಯ.', curAvailableSlots, 'appointmentTime');
      }
      else {
        addActionMessage('bot', 'Appointments not available. Please choose a different date. / ಅಪಾಯಿಂಟ್ಮೆಂಟ್ಸ್ ಇಲ್ಲ. ಬೇರೆ ದಿನಾಂಕ ಆಯ್ಕೆ ಮಾಡಿ', getNextTwoDates(), 'appointmentDate');
      }
    }
    else if (selectedAppointment['status'] == 'inprogress') {
      //window.confirm(selectedAppointment['status']);

      if (window.confirm('Booking appointment(ಅಪಾಯಿಂಟ್ಮೆಂಟ್) at ' + selectedAppointment['appointmentTime'] + ' on ' + selectedAppointment['appointmentDate'] + '. Continue / ದೃಢೀಕರಿಸಿ ?')) {
        if (bookAppointment(selectedAppointment)) {
          selectedAppointment['status'] = 'scheduled';
          addActionMessage('bot', 'Confirmed appointment / ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ದೃಢಪಡಿಸಿದೆ: ' + selectedAppointment['appointmentTime'] + ' on ' + selectedAppointment['appointmentDate'] + '. Please arrive 5 mins earlier to complete registration. Cancel the appointment if you cannot make it. Thank you.', 'cancel appointment, exit chat', 'status');
        }
      }
    }
    else if (selectedAppointment['status'] == 'scheduled')
    {
      addActionMessage('bot', 'Confirmed appointment / ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ದೃಢಪಡಿಸಿದೆ: ' + selectedAppointment['appointmentTime'] + ' on ' + selectedAppointment['appointmentDate'] + '. Thank you / ಧನ್ಯವಾದ.', 'cancel appointment, exit chat', 'status');
    }
    else if (selectedAppointment['status'] == 'cancel appointment')
    {
      if (window.confirm('You are CANCELLING the appointment at ' + selectedAppointment['appointmentTime'] + ' on ' + selectedAppointment['appointmentDate'] + '. Confirm Cancellation?')) 
      {
        await deleteAppointment(selectedAppointment);
        selectedAppointment['patientPhone'] = '';
        selectedAppointment['appointmentDate'] = '';
        selectedAppointment['appointmentTime'] = '';
        selectedAppointment['status'] = 'inprogress';
        addActionMessage('bot','Your appointment is cancelled / ರದ್ದುಮಾಡಲಾಗಿದೆ . Thank you.','','patientPhone');
      }
    }
    else if (selectedAppointment['status'] == 'exit chat')
    {
      window.close();
    }

  };

  const moment = require('moment');
  const fetchAppointments = async (date) => {
    try {
      console.log("test");
      const parsedDate = moment(selectedAppointment.appointmentDate, 'ddd D MMM YYYY');
      const formattedDate = parsedDate.format('YYYY-MM-DD');
      console.log("formatted date: " , formattedDate);
      const response = await axios.post(
        'https://h878q1k811.execute-api.us-west-2.amazonaws.com/Prod/appointments',
        { appointmentDate: formattedDate }
      );
      console.log(response.data);
      console.log(response.data.availableSlots);

      // Get the current date and time
      const currentDate = new Date();
      const currentHour = currentDate.getHours();

      // Check if the appointment date is today
      const isToday = new Date(selectedAppointment.appointmentDate).toDateString() === currentDate.toDateString();
      //const isToday = true;

      // Filter available slots less than the current hour if the appointment date is today
      const filteredSlots = isToday
        ? response.data.availableSlots.filter((slot) => {
          const slotHour = parseInt(slot.split(':')[0], 10);
          console.log(slotHour + ':' + currentHour);  
          return slotHour > currentHour;
        })
        : response.data.availableSlots;

      // Join available slots with a comma
      const availableSlots = filteredSlots.join(',');

      return availableSlots;
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };


  const deleteAppointment = async (appointment) => {
    try {
      await axios.delete(
        "https://h878q1k811.execute-api.us-west-2.amazonaws.com/Prod/appointments",
        {
          data: { patientPhone: appointment.patientPhone }
        }
      );
      console.log(`Appointment with phone number ${appointment.patientPhone} deleted`);
    } catch (error) {
      console.error(error);
    }
  };

  const bookAppointment = async (appointment) => {
    setSelectedAppointment(appointment);

    try {
      const response = await axios.put(
        'https://h878q1k811.execute-api.us-west-2.amazonaws.com/Prod/appointments',
        {
          appointmentDate: appointment.appointmentDate,
          appointmentTime: appointment.appointmentTime,
          patientName: appointment.patientName,
          patientPhone: appointment.patientPhone,
          patientEmail: 'NA',
        }
      );
      console.log(response.data);
      return true;
      setMessages([
        ...messages,
        {
          type: 'bot',
          content: `Confirmed appointment at ${selectedAppointment.appointmentTime} on ${selectedAppointment.appointmentDate}.`,
        },
      ]);
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  return (
    <Container maxWidth="sm" className={classes.container}>
      <CssBaseline />
      <Box my={4}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
        >
          Dr. Sheela's Clinic - HKCC
        </Typography>
      </Box>

      <Paper className={classes.chatArea}>
        {messages.map((message, index) => (
          <div key={index}>

            <Typography
              variant="body1"
              className={`${classes.message} ${message.type === 'user' ? classes.userMessage : classes.botMessage
                }`}
              style={{
                alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
                textAlign: message.type === 'user' ? 'right' : 'left',
              }}
            >
              {message.type === 'bot' && (
                <AssistantIcon style={{ marginLeft: '0rem', marginRight: '0.5rem', fontSize: '1.2rem', color: 'rgba(30, 144, 255, 0.8)' }} />
              )}
              {message.content}
              {message.type === 'user' && (
                <PersonIcon style={{ marginLeft: '0.5rem', marginRight: '0rem', fontSize: '1.2rem', color: 'rgba(30, 144, 255, 0.8)' }} />
              )}


            </Typography>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </Paper>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
          <CircularProgress />
        </div>
      )}

      <div className={classes.messageInput}>
        <div className={classes.inputWrapper}>
          {curMessage && curMessage.action && (
            <div className={classes.actionButtons}>
              {curMessage.action.split(',').map((action, idx) => (
                <Button
                  key={idx}
                  className={classes.pillButton}
                  onClick={() => handleAction(action, curMessage.target)}
                >
                  {action}
                </Button>
              ))}
            </div>
          )}
          <div className={classes.inputWrapper}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Type your message"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSendDisabled(e.target.value === '');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !sendDisabled) {
                    handleAction(input, (curMessage && curMessage.target) || 'dummy');
                    setInput('');
                    setSendDisabled(true);
                  }
                }}
              />

              <IconButton
                aria-label="send"
                disabled={sendDisabled}
                onClick={() => {
                  handleAction(input, (curMessage && curMessage.target) || 'dummy');
                  setInput('');
                  setSendDisabled(true);
                }}
              >
                <SendIcon />
              </IconButton>
            </div>
          </div>

        </div>
      </div>
    </Container>
  );

}


export default AppointmentChatbot;