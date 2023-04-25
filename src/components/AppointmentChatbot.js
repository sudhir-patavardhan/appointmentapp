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
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  chatArea: {
    minHeight: '60vh',
    maxHeight: '60vh',
    overflowY: 'scroll',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: 'rgba(244, 246, 249, 1)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  message: {
    padding: theme.spacing(1, 2),
    borderRadius: '20px',
    margin: theme.spacing(1, 0),
    wordBreak: 'break-word',
    maxWidth: '95%',
  },
  userMessage: {
    backgroundColor: 'rgba(30, 144, 255, 0.5)',
  },
  botMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  messageInput: {
    display: 'flex',
    alignItems: 'center',
  },
  inputWrapper: {
    flexGrow: 1,
    marginRight: theme.spacing(1),
    position: 'relative',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(1),
  },
  pillButton: {
    margin: theme.spacing(0.5),
    borderRadius: '20px',
    textTransform: 'none',
    backgroundColor: '#3f51b5',
    color: 'white',
    '&:hover': {
      backgroundColor: '#5c6bc0',
    },
  },
}));

const AppointmentChatbot = () => {

  const [date, setDate] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ "type": "bot", "content": "Welcome to the appointment scheduler. Please enter your phone number", "action": "", "target": "patientPhone" }]);
  const [selectedAppointment, setSelectedAppointment] = useState({
    language: 'English',
    appointmentDate: '',
    patientPhone: '',
    purpose: 'appointment',
    appointmentTime: '',
    patientName: 'NA',
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    return today.toISOString().split('T')[0] + ',' + tomorrow.toISOString().split('T')[0];
  };

  const addMessage = (actor, message) => {
    setMessages((prevMessages) => [...prevMessages, { type: actor, content: message }]);
  }

  const addActionMessage = (actor, message, actions, target) => {
    setMessages((prevMessages) => [...prevMessages, { type: actor, content: message, action: actions, target: target }]);
    setCurMessage({ action: actions, target: target, });
  }

  const handleAction = async (option, target) => {
    // You can add the logic to handle button clicks here.
    console.log('Button clicked:', option);
    addMessage('user', option);
    console.log(selectedAppointment);

    selectedAppointment[target] = option;
    setCurMessage(null);

    setInput('');

    if (selectedAppointment['language'] === '') {
      addActionMessage('bot', 'What language do you prefer? ನೀವು ಯಾವ ಭಾಷೆಯನ್ನು ಬಳಸಲು ಬಯಸುತ್ತೀರಿ?', 'ಕನ್ನಡ, English', 'language');
    }
    else if (selectedAppointment['patientPhone'] === '') {
      addActionMessage('bot', 'Welcome to the appointment scheduler. Please enter your phone number.', '', 'patientPhone');
    }
    else if (selectedAppointment['patientName'] === '') {
      addActionMessage('bot', 'Please enter the patient\'s name', '', 'patientName');
    }
    else if (selectedAppointment['purpose'] === '') {
      addActionMessage('bot', 'Do want an Appointment or directions to clinic?', 'appointment, directions to clinic', 'purpose');
    }
    else if (selectedAppointment['appointmentDate'] === '') {
      addActionMessage('bot', 'When do you want the appointment?', getNextTwoDates(), 'appointmentDate');
    }
    else if (selectedAppointment['appointmentTime'] === '') {
      const curAvailableSlots = await fetchAppointments();
      if (curAvailableSlots) {
        addActionMessage('bot', 'Choose from available slots', curAvailableSlots, 'appointmentTime');
      }
      else {
        addActionMessage('bot', 'Appointments not available. Please choose a different date.', getNextTwoDates(), 'appointmentDate');
      }
    }
    else {
      handleAppointmentSelect(selectedAppointment);
    }

  };


  const fetchAppointments = async (date) => {
    try {
      const response = await axios.post(
        'https://h878q1k811.execute-api.us-west-2.amazonaws.com/Prod/appointments',
        { appointmentDate: selectedAppointment.appointmentDate }
      );
      console.log(response.data);
      console.log(response.data.availableSlots);

      // Join available slots with a comma
      const availableSlots = response.data.availableSlots.join(',');

      return availableSlots;
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };


  const handleAppointmentSelect = async (appointment) => {
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

      setMessages([
        ...messages,
        {
          type: 'bot',
          content: `You have successfully booked an appointment at ${selectedAppointment.appointmentTime} on ${selectedAppointment.appointmentDate}.`,
        },
      ]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setMessages([
        ...messages,
        { type: 'bot', content: 'Error booking appointment. Please try again.' },
      ]);
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
          style={{
            background: 'linear-gradient(to right, #1c3f95, #224aa3)',
            color: '#fff',
            padding: '1rem',
            fontSize: '1.5rem',
            borderRadius: '10px',
          }}
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