import { useState } from "react";

const taskType = "one" | "daily" |"weekly";

type TaskPremium = {
    id: string;
    text: string;
    createdAt: number;
    done: boolean;

    type: taskType;
};

export default function TodoPremium() {
    const [tasks, setTasks] = useState<TaskPremium[]>(() => {
        const stored = localStorage.getItem("tasks_premium");
        return stored ? JSON.parse(stored) : [];
      });
    return (
        <div>
            <h1>TODOLIST ++</h1>
        </div>
    )
}