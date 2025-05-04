import React from "react";
import './Dashboard.css';
import Habits from "./Habits/Habits";
import Stocks from "./Stocks/Stocks";
import Rewards from "./Rewards/Rewards";

const Dashboard = () => {
    return(
        <div className="dashboard">
            <div className="habits-dashboard">
                <Habits />
            </div>
            <div className="stocks-dashboard">
                <Stocks />
            </div>
            <div className="rewards-dashboard">
                <Rewards />
            </div>
        </div>
    );
};

export default Dashboard;