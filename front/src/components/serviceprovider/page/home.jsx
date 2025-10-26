import React from "react";
import FoodCardList from "../components/Order.jsx";

function Home({ onConfirmOrder, selectedKad, searchQuery }) {
  return (
    <div className="p-4">
      {/* รายการอาหาร */}
      <FoodCardList 
        onConfirmOrder={onConfirmOrder} 
        selectedKad={selectedKad} 
        searchQuery={searchQuery} 
      />
    </div>
  );
}

export default Home;
