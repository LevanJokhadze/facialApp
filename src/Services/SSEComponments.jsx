import React, { useEffect, useState } from "react";
import { Card } from "../Components/Cards";

const SSEComponent = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetch("http://127.0.0.1:5000/get-tasks")
        .then((response) => response.json())
        .then((data) => setTasks(data))
        .catch((error) => console.error("Error fetching initial tasks:", error));
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const handleClear = async () => {
    try {
      const response = await fetch("https://octopus-app-hlj7o.ondigitalocean.app/clear-tasks", {
        method: "GET", // Adjust the method if needed
      });
      if (!response.ok) {
        throw new Error("Failed to clear tasks");
      }
      console.log("Tasks cleared successfully");
      setTasks([]); // Optionally clear tasks from local state as well
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <button className="clear-button" onClick={handleClear}>
        Clear
      </button>
      
      <div>
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            message={task.message} 
            user_name={task.user_name} 
            room_number={task.room_number} 
            function_name={task.function_name} 
            timestamp={task.timestamp}
          />
        ))}
      </div>
    </div>
  );
};

export default SSEComponent;
