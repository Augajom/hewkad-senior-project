import React from "react";
import OrderStatus from "./OrderStatus";
import "../DaisyUI.css";

const SP_OrderStatus = ({ orderingList, onConfirmPayment, onComplete }) => {
  return (
    <section className="w-full">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200/50 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">HEW</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Orders in Progress
              </h2>
              <p className="text-xs text-slate-500">
                Manage orders that are currently being processed
              </p>
            </div>
          </div>
          {orderingList?.length > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {orderingList.length} orders
            </span>
          )}
        </div>

        {orderingList.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            You don&apos;t have any active orders.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {orderingList.map((order) => (
              <OrderStatus
                key={order.id}
                profileImg={order.profileImg}
                name={order.name}
                username={order.username}
                location={order.location}
                shopName={order.shopName}
                item={order.item}
                price={order.price}
                fee={order.fee}
                status={order.status}
                onConfirmPayment={() => onConfirmPayment(order.id)}
                onSendProof={(file) => onComplete(order.id, file)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SP_OrderStatus;
