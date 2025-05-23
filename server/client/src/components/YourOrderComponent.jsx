import React, { useEffect, useState } from "react";

const YourOrder = () => {
  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    customerName: "",
    contactNo: "",
  };

  const [contactNumber] = useState(authUser.MobileNo || "");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/get-filtered-order/${contactNumber}`,
          // const response = await fetch(`https://order-flow-api-ek8r.onrender.com/api/get-filtered-order/${contactNumber}`,
          // const response = await fetch(`https://order-flow-api.vercel.app/api/get-filtered-order/${contactNumber}`,
          // const response = await fetch(`http://localhost:8000/api/get-filtered-order/${contactNumber}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.log(error, "hii");

          throw new Error(`${response.statusText}`);
        }

        const data = await response.json();
        console.log(data.data);

        setOrders(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [contactNumber]);

  const handleRemoveItem = (index) => {
    const updatedOrders = orders.filter((_, i) => i !== index);
    setOrders(updatedOrders);
  };

  return (
    <div className="container mx-auto p-6 bg-[#cbbba7] min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">My Orders</h2>

      {/* Floating Order Count */}
      <div className="h-16 w-16 flex-col bg-green-100 shadow-lg fixed z-50 top-4 right-4 rounded-3xl flex justify-center items-center">
        <div className="text-[0.7rem] font-extrabold">Orders</div>
        <div className="font-bold">{orders.length}</div>
      </div>

      {/* Loading and Error States */}
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* No Orders Message */}
      {orders.length === 0 && !loading && !error && (
        <p className="text-center text-gray-600">No orders found.</p>
      )}

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {orders.map((order, index) => (
          <div
            key={index}
            className="bg-[#e9e1d5] rounded-lg p-6 shadow-md transform transition-transform duration-300 hover:-translate-y-2"
          >
            {/* Header with Order Status */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-sm px-3 py-1 rounded-full shadow-md bg-gray-200">{order[1]}</h3>
              <div className={`col-span-1 text-base font-bold px-3 py-1 rounded-full shadow-md ${order[0] == "ROLL" ? "bg-pink-200" : order[0] == "CUT" ? "bg-blue-200" : "bg-purple-200"} `}>{order[0]}</div>
              <div
                className={`text-sm font-semibold px-3 py-1 rounded-full shadow-md ${["Pending", "Hold"].includes(order[23])
                  ? "bg-yellow-100 text-yellow-500"
                  : ["Cancel", "Reject", "Declined"].includes(order[23])
                    ? "bg-red-100 text-red-500"
                    : "bg-green-100 text-green-500"
                  }`}
              >
                {order[23]}
              </div>

            </div>

            <div className="text-left">
              <h4 className="italic text-sm mb-2 mt-2">Order Id : {order[3]}</h4>
            </div>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold text-[#78624e]">{order[10]}</h3>
              <div className="col-span-[0.5]">{order[4]}</div>

            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-y-3 text-[#8c7764]">
              <div className="col-span-2 font-bold text-lg  text-gray-500 mb-2">{order[11]}</div>

              {/* <div className="font-semibold">Color No.</div>
              <div className="col-span-1">{": " + order[12]}</div>

              <div className="font-semibold">Width</div>
              <div className="col-span-1">{": " + order[13]}</div> */}

              <div className="font-semibold">Quantity</div>
              <div className="col-span-1">{": " + order[14] + " " + order[15]}</div>

              <div className="font-semibold">Rate</div>
              <div className="col-span-1">{": " + order[16]}</div>

              <div className="font-semibold">Amount</div>
              <div className="col-span-1 font-bold text-blue-600">{": " + order[17]}</div>

              <div className="font-semibold">Dispatch By</div>
              <div className="col-span-1">{": " + order[18]}</div>

              <div className="font-semibold">Dispatcher Name</div>
              <div className="col-span-1">{": " + order[19]}</div>

              <div className="font-semibold">Invoice No</div>
              <div className="col-span-1">: {order[25] ? order[25] : " "}</div>

              <div className="font-semibold">Invoice Pdf</div>
              <div className="col-span-1">: {order[26] ? <a href={order[26]} className="px-3 py-2 rounded-2xl bg-[#8c7764] text-white" target="_blank">View Invoice</a> : " "}</div>

              <div className="font-semibold">Docket No.</div>
              <div className="col-span-1">: {order[27] ? order[27] : " "}</div>

              <div className="font-semibold">Docket Pdf</div>
              <div className="col-span-1">: {order[28] ? <a href={order[28]} className="px-3 py-2 rounded-2xl bg-[#8c7764] text-white" target="_blank">View Docket</a> : " "}</div>
              {/* <div className="col-span-1">: <a className="h-5 w-10 bg-green-500 text-white px-3 py-1 rounded-xl" target="_blank" href={order[25] ? order[25] : " "}>View LR</a></div> */}


              <div className="font-semibold">Remark</div>
              <div className="col-span-1 text-gray-500">: <span className="italic">{order[24] ? order[24] : ""}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>

  );
};

export default YourOrder;
