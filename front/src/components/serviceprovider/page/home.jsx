import React from "react";
import FoodCardList from "../components/Order.jsx";

function Home({ onConfirmOrder }) {
  return (
    <div className="p-4">
      

      {/* รายการอาหาร */}
      <FoodCardList onConfirmOrder={onConfirmOrder} />
    </div>
  );
}

export default Home;
