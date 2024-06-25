import React from 'react';
import {TextField, List, ListItem, ListItemText, Paper, Button} from '@mui/material';

const App = () => {
  const [messages, setMessages] =React.useState([]);
  const [input, setInput] =React.useState(''); 
  
  const handleSendMessage =() =>{
    if (input.trim()){
      setMessages([...messages,input]);
      setInput('');
    }
  };

  return (
    <div className="container mt-5">
     <div className="row justify-content-center">
      <div className="col-md-6">
       <h1 className="text-center">Chat Application</h1>
       <Paper style={{height:'60vh', overflow:'auto', marginBottom: '1rem'}}>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index}>
              <ListItemText primary={message}/>
            </ListItem>
          ))}
        </List>
       </Paper>
       <TextField
            fullWidth
            label="Type a message"
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}/>
          <Button 
            variant="contained" 
            color="primary" 
            className="mt-3" 
            onClick={handleSendMessage}>
            Send
          </Button>
      </div>
      </div>
    </div>
  );
};

export default App;
