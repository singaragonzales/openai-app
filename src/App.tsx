import { useEffect, useState } from 'react'
import User from '../assets/user.svg'
import SendIcon from "../assets/send.svg"
import Bot from "../assets/bot.svg"
import { BASE_URL, RAPIDAI_API_KEY, RAPIDAI_HOST, generateUniqueId} from './utils/utils';
import axios from 'axios';

function App() {

  interface Responses {
    isAi: boolean;
    value: string;
    uniqueId: string;
  }

  const [message, setMessage] = useState("")
  const [responses, setResponses] = useState<any>([])
  const [placeholder, setPlaceholder] = useState<string>("")
  const [lastAnswer, setLastAnswer] = useState<string>('');

  var loaderInterval:any;
  function loader(){
    let index = 0;
    loaderInterval = setInterval(() => {
      setLastAnswer(prev => prev + ".");
      index ++
      if(index === 4){
        setLastAnswer("");
        index = 0
      }
    }, 300)
  }

  const [counter, setCounter] = useState(0);
  useEffect(() => {
    if(responses.length !== 0 && placeholder !== ''){
      const intervalId = setInterval(() => {
        if (counter === placeholder.length) {
          clearInterval(intervalId);
          return;
        }
        const currentLetter = placeholder[counter];
        setLastAnswer(prevLastAnswer => prevLastAnswer + currentLetter);
        setCounter(prevCounter => prevCounter + 1);
      }, 10);
  
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [responses, placeholder, counter]);

  function ChatStripe({isAi, value, uniqueId = ""}: Responses){
    return(
      <div className={`wrapper ${isAi && 'ai'}`}>
        <div className="chat">
          <div className="profile">
            <img src={isAi ? Bot : User} alt={isAi ? 'Bot' : 'User'} />
          </div>
          <div className="message" id={uniqueId}>{value}</div>
        </div>
      </div>
    )
  }

  const grabUserQuestion = () => {
    let objUser = {
      isAi: false,
      value: message,
      uniqueId: ""
    }
    setResponses((responses:any) => [...responses, objUser])
    setMessage("")
  }

  const grabBot1Question = () => {
    const uniqueId = generateUniqueId()
    let objAI = {
      isAi: true,
      value: " ",
      uniqueId: uniqueId
    }
    setResponses((responses:any) => [...responses, objAI])
  }

  const handleSubmit = async(e: any) =>{
    e.preventDefault();
    loader();
    grabUserQuestion()
    grabBot1Question()

   
    axios.post(BASE_URL, {
      data:{
        question: message
      }
    }, {
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': RAPIDAI_API_KEY,
        'X-RapidAPI-Host': RAPIDAI_HOST
      },
      
    }).then((response) => {
      clearInterval(loaderInterval)
      setResponses((prevResponses: any) => {
        // Crear una copia del array de respuestas
        let newArr = [...prevResponses];
        // Actualizar el valor de 'value' en el último objeto de respuesta
        newArr[newArr.length - 1]['value'] = response.data.answer;
        // Retornar el nuevo array actualizado
        return newArr;
      });

      setPlaceholder(response.data.answer);
      setLastAnswer(response.data.answer);
      
    }).catch(function (error) {
      clearInterval(loaderInterval);
      setLastAnswer("");
      let string= 'Something went wrong, please try again later'
      setResponses((prevResponses: any) => {
        let newArr = [...prevResponses];
        newArr[newArr.length - 1]['value'] = string;
        return newArr;
      });
      setPlaceholder(string);
    });
  }
  
  function fillResponses() {
    if(lastAnswer === ""){
      return(
        <>
          {responses.map((resp: Responses) => (
            <ChatStripe 
              isAi={resp?.isAi}
              value={resp?.value}
              uniqueId={resp?.uniqueId}
            />
          ))}
        </>
      )
    }else{
      let copy = [...responses.slice(0, -1)];
      return(
        <>
            {copy.map((resp: Responses) => (
              <ChatStripe 
                isAi={resp?.isAi}
                value={resp?.value}
                uniqueId={resp?.uniqueId}
              />
            ))}
          </>
      ) 
    }
  }
  return (
    <div id="chat_container">
      <div className="message">
          {fillResponses()}
          
          {lastAnswer !== "" && (
            <ChatStripe 
              isAi={responses[responses.length - 1]?.isAi}
              value={lastAnswer}
              uniqueId={responses[responses.length - 1]?.uniqueId}
            />
          )}
      </div>
      <form>
        <textarea name="prompt" id="" cols={1} rows={1} placeholder='Ask OpenAI...'
          value={message}
          onChange={(e) => {
            setMessage(e.target.value)
            setLastAnswer("");
            setPlaceholder("");
          }}
        ></textarea>
        <button type='button'
          disabled={message.trim() === ""}
          onClick={(e) => {
            handleSubmit(e)
          }}
          onKeyUp={(e) => {
            if(message.trim() !== ""){
              if(e.keyCode === 13){
                handleSubmit(e);
              }
            }
          }}
        ><img src={SendIcon} alt="" /></button>
      </form>
    </div>
  )
}

export default App
