import React, { useEffect, useState } from "react";
import { Card } from "../Components/Cards";

const SSEComponent = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch("https://octopus-app-hlj7o.ondigitalocean.app/get-tasks")
        .then((response) => response.json())
        .then((data) => setTasks(data))
        .catch((error) => console.error("Error fetching initial tasks:", error));
    }, 2000);
  
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      console.log(tasks);
    }
  }, [tasks]);

  
  return (
    <div>        
      {tasks.map((task) => (
          <Card key={task.id} message={task.message} user_name={task.user_name} room_number={task.room_number} timestamp={task.timestamp}/>
        ))}
    </div>
  );
};

export default SSEComponent;