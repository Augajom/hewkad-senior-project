import React from "react";
import OrderStatus from "./OrderStatus";
import './DaisyUI.css'

const SP_OrderStatus = ({ orderingList, onConfirmPayment, onComplete }) => {
  return (
    <div>
      <h2 className="text-lg text-black font-bold mb-4">รายการที่กำลังสั่ง</h2>
      <div className="flex flex-wrap gap-4">
        {orderingList.map((order) => (
          <OrderStatus
            key={order.id}
            {...order}
            onConfirmPayment={() => onConfirmPayment(order.id)}
            onSendProof={(file) => onComplete(order.id, file)}
          />
        ))}
      </div>
    </div>
  );
};

export default SP_OrderStatus;
