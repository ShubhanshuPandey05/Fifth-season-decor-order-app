import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLoading } from "../context/LoadingContext";

export default function UserComponent() {

  const authUser = JSON.parse(localStorage.getItem("authUser")) || {
    customerName: "",
    contactNo: "",
    companyName: "",
    state: "",
    city: ""
  };

  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("");
  const [contactNo] = useState(authUser.MobileNo || "");
  const [companyName] = useState(authUser.Companyname || "");
  const [state] = useState(authUser.State)
  const [city] = useState(authUser.City)
  const [items, setItems] = useState([
    {
      name: "",
      unit: "",
      quantity: "",
      quality: "",
      clrNo: "",
      width: "",
      rate: "",
      amount: "",
      itemNote: "",
      customCatalog: "",
      customQuality: "",
      isOtherCatalog: false,
      catalogSelected: false
    },
  ]);

  const [dispatchThrough, setDispatchThrough] = useState("");
  const [deliveryTo, setDeliveryTo] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [catalogOptions, setCatalogOptions] = useState([]);
  const { showLoading, hideLoading } = useLoading();
  const [qualityOptions, setQualityOptions] = useState([]);
  const [widthOptions, setWidthOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [poNo, setPoNo] = useState('')
  // const [isOtherCatalog, setIsOtherCatalog] = useState(false);
  // const [isOtherQuality, setIsOtherQuality] = useState(false);
  // const [catalogSelected, setCatalogSelected] = useState(false);




  useEffect(() => {
    async function fetchCatalog() {
      try {
        showLoading();
        // const response = await fetch("http://localhost:8000/api/get-order-catalog", {
        const response = await fetch("/api/get-order-catalog", {
          // const response = await fetch("https://order-flow-api-ek8r.onrender.com/api/get-order-items", {
          // const response = await fetch("https://order-flow-api.vercel.app/api/get-order-items", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const data = await response.json();
        // console.log(data);
        setCatalogOptions(data.catalog);
        setColorOptions(data.colors);
        setWidthOptions(data.width)
        hideLoading();

      } catch (error) {
        console.error("Error fetching item names:", error);
        toast.error('No items fetched try again later')
        let token = getCookie("jwt")
        // if (!token) {
        //   localStorage.removeItem("authUser");
        //   window.location.reload();
        // }
        hideLoading();
      }
    }
    fetchCatalog();
  }, []);


  // const units = ["Mtr",orderType=="ROLL"??"ROLL"];
  const orderTypeList = ["CUT", "ROLL", "FOLDER"];

  const handleItemChange = (index, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };

          // Update amount if quantity or rate changes
          if (field === "quantity" || field === "rate") {
            const quantity = updatedItem.quantity;
            const rate = updatedItem.rate;
            updatedItem.amount = quantity && rate ? (quantity * rate).toFixed(2) : "";
          }

          // Update catalog-related flags
          if (field === "name") {
            updatedItem.isOtherCatalog = value === "Other";
            updatedItem.catalogSelected = !(value === "Other" || value === "");
          }

          // Update quality-related flag
          if (field === "quality") {
            updatedItem.isOtherQuality = value === "Other";
          }

          return updatedItem;
        }
        return item;
      })
    );
  };


  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleAddItem = () => {
    setItems((prevItems) => [
      ...prevItems,
      {
        name: "",
        unit: "",
        quantity: "",
        quality: "",
        clrNo: "",
        width: "",
        rate: "",
        amount: "",
        itemNote: "",
        customCatalog: "",
        customQuality: "",
        isOtherCatalog: false,
        catalogSelected: false,
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (index != 0) {
      setItems(items.filter((_, i) => i !== index));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const confirmOrder = async () => {
    try {
      showLoading();
      const processedItems = items.map((item) => {
        const processedItem = { ...item };
        if (item.name === "Other" && item.customCatalog) {
          processedItem.name = item.customCatalog; // Replace 'name' with the custom catalog name
          delete processedItem.customCatalog; // Remove the customCatalog field
        }
        if (item.quality === "Other" && item.customQuality) {
          processedItem.quality = item.customQuality; // Replace 'quality' with the custom quality name
          delete processedItem.customQuality; // Remove the customQuality field
        }
        return processedItem;
      });
      // const response = await fetch("https://order-flow-api.vercel.app/api/update-spreadsheet", {
      const response = await fetch("/api/update-spreadsheet", {
        // const response = await fetch("https://order-flow-api-ek8r.onrender.com/api/update-spreadsheet", {
        // const response = await fetch("http://localhost:8000/api/update-spreadsheet", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, poNo, customerName, contactNo, state, city, items: processedItems, dispatchThrough, deliveryTo, deliveryAddress, orderNote, orderType }),
        credentials: 'include',
      });

      if (response.ok) {
        setItems([{
          name: "",
          unit: "",
          quantity: "",
          quality: "",
          clrNo: "",
          width: "",
          rate: "",
          amount: "",
          itemNote: "",
          customCatalog: "",
          customQuality: "",
          isOtherCatalog: false,
          catalogSelected: false,
        }]);
        setDispatchThrough("");
        setDeliveryTo("");
        setOrderNote("")
        setDeliveryAddress("")
        setOrderType("")
        setShowSuccessModal(true);
      } else {
        const jwt = getCookie('jwt');
        if (!jwt) {
          localStorage.removeItem("authUser");
          window.location.reload();
          toast.error("Please login again");
        }
      }
      hideLoading();
      setShowConfirmModal(false)
    } catch (error) {
      hideLoading();
      console.error("Error updating spreadsheet:", error);
      setShowConfirmModal(false)
    }
  };


  const fetchQualityOptions = async (catalogName, index) => {
    if (!catalogName) {
      setQualityOptions([])
      return
    };

    try {
      showLoading();
      const response = await fetch(`/api/get-order-quality/${catalogName}`, {
        // const response = await fetch(`http://localhost:8000/api/get-order-quality/${catalogName}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      // setQualityOptions(data.data);
      setQualityOptions((prev) => ({ ...prev, [index]: data.data || [] }));
      hideLoading();
    } catch (error) {
      console.error('Error fetching quality data:', error);
      hideLoading()
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 pb-14">
      <div className="p-6 w-full max-w-6xl min-h-screen">
        <h1 className="text-4xl font-semibold md:font-bold text-center">
          Fifth Season Decor
        </h1>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-500 mt-3 text-center md:font-bold">
          Order Flow
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Customer Info */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <input
                type="hidden"
                readOnly
                value={companyName}
                className="mt-2 border border-gray-300 rounded-md p-3 bg-gray-100 text-gray-700"
                required
              />
            </div>
            <div className="flex flex-col">
              <input
                type="hidden"
                readOnly
                value={"+91 " + contactNo}
                className="mt-2 border border-gray-300 rounded-md p-3 bg-gray-100 text-gray-700"
              />
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                value={customerName}
                placeholder="Person Name"
                className="mt-2 border border-gray-300 rounded-md p-2 text-gray-700"
                onChange={(e) => { setCustomerName(e.target.value) }}
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="border-gray-300 rounded-md p-2 w-[38%]"
                required
              >
                <option value="">Order Type</option>
                {orderTypeList.map((unit, index) => (
                  <option key={index} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <div className="flex flex-col w-[60%]">
                <input
                  type="text"
                  value={poNo}
                  placeholder="Ref/PO. No."
                  className="mt-2 border border-gray-300 rounded-md p-2 text-gray-700 mb-2"
                  onChange={(e) => { setPoNo(e.target.value) }}
                />
              </div>
            </div>
          </div>


          {/* Items Section */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Item Details</h2>
            {items.map((item, index) => (
              <div
                key={index}
                className="grid gap-2 sm:grid-cols-6 sm:items-center bg-gray-200 p-2 rounded-md mb-4"
              >
                {/* Catalog Name */}
                <div className="col-span-6 md:col-span-3">
                  <select
                    value={item.name}
                    onChange={(e) => {
                      handleItemChange(index, "name", e.target.value);
                      fetchQualityOptions(e.target.value, index); // Assume this function fetches quality options
                    }}
                    className="border-gray-300 rounded-md p-2 w-full"
                    required
                  >
                    <option value="">Select Catalog *</option>
                    {catalogOptions.map((option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    ))}
                    <option value="Other">Not listed here</option>
                  </select>
                </div>

                {/* Custom Catalog Input */}
                {item.isOtherCatalog && (
                  <input
                    type="text"
                    placeholder="Enter Catalog Name"
                    value={item.customCatalog || ""}
                    onChange={(e) => handleItemChange(index, "customCatalog", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full col-span-6 md:col-span-3"
                  />
                )}

                {/* Catalog PDF Button */}
                {item.catalogSelected && qualityOptions[index]?.[0]?.startsWith("http") && (
                  <div className="col-span-3">
                    <button
                      type="button"
                      className="bg-green-500 px-4 py-2 text-white rounded-xl"
                    >
                      <a
                        href={qualityOptions[index][0]}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Catalog Pdf
                      </a>
                    </button>
                  </div>
                )}

                {/* Quality Name */}
                <div className="col-span-6 md:col-span-3">
                  <select
                    value={item.quality}
                    onChange={(e) => {
                      handleItemChange(index, "quality", e.target.value);
                      setItems((prevItems) =>
                        prevItems.map((itm, i) =>
                          i === index
                            ? { ...itm, isOtherQuality: e.target.value === "Other" }
                            : itm
                        )
                      );
                    }}
                    className="border-gray-300 rounded-md p-2 w-full"
                    required
                  >
                    <option value="">Select Quality *</option>
                    {qualityOptions[index]
                      ?.slice(qualityOptions[index][0]?.startsWith("http") ? 1 : 0)
                      .map((quality, i) => (
                        <option key={i} value={quality}>
                          {quality}
                        </option>
                      ))}
                    <option value="Other">Not listed here</option>
                  </select>
                </div>

                {/* Custom Quality Input */}
                {item.isOtherQuality && (
                  <input
                    type="text"
                    placeholder="Enter Quality Name"
                    value={item.customQuality || ""}
                    onChange={(e) => handleItemChange(index, "customQuality", e.target.value)}
                    className="border-gray-300 rounded-md p-2 w-full col-span-6 md:col-span-3"
                  />
                )}

                {/* Second Line: Width, Color No, Unit, Quantity, Rate, Amount, and Delete Button */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2 col-span-6">
                  {/* Width and Color - Grouped in One Row for Mobile */}
                 {/*<div className="col-span-2 md:col-span-2 flex gap-2">
                    <select
                      value={item.width}
                      onChange={(e) => handleItemChange(index, 'width', e.target.value)}
                      className="border-gray-300 rounded-md p-2 w-full"
                    >
                      <option value="">Width</option>
                      {widthOptions.map((option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <select
                      value={item.clrNo}
                      onChange={(e) => handleItemChange(index, 'clrNo', e.target.value)}
                      className="border-gray-300 rounded-md p-2 w-full"
                    >
                      <option value="">Clr No.</option>
                      {colorOptions.map((option, i) => (
                        <option key={i} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div> */}

                  {/* Unit, Quantity, and Rate - Grouped in One Row for Mobile */}
                  <div className="col-span-2 md:col-span-3 flex gap-2">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="border-gray-300 rounded-md p-2 w-full"
                    >
                      <option value="Mtrs">Mtrs</option>
                      {orderType=="ROLL"??<option value="ROLL">Roll</option>}
                      {orderType=="FOLDER"??<option value="FOLDER">Folder</option>}
                      {/* {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))} */}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty *"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="border-gray-300 rounded-md p-2 w-full"
                      min={1}
                      required
                    />

                    {/* <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                      className="border-gray-300 rounded-md p-2 w-full"
                      min={1}
                    /> */}
                  </div>

                  {/* Amount and Delete Button - Grouped in One Row for Mobile */}
                  <div className="col-span-2 md:col-span-2 flex gap-2 items-center">
                    <input
                      type="text"
                      readOnly
                      placeholder="Amount"
                      value={item.amount}
                      className="border-gray-300 bg-gray-100 rounded-md p-2 w-full"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="flex justify-center items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-500 hover:text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-1 14H6L5 7m5-3h4m-4 0a1 1 0 00-1 1v1h6V5a1 1 0 00-1-1h-4zm-2 4h8m-5 4h2m-2 4h2"
                        />
                      </svg>
                    </button>
                  </div>
                </div>


                {/* Item Note */}
                {/* <div className="col-span-6">
                  <textarea
                    name="itemNote"
                    value={item.itemNote}
                    onChange={(e) => handleItemChange(index, 'itemNote', e.target.value)}
                    className="w-full h-[40px] p-2 rounded-md"
                    placeholder="Item Note"
                  ></textarea>
                </div> */}
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              + Add Item
            </button>
          </div>

          {/* Dispatch and Due Days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div className="col-span-1">
              <input
                type="text"
                placeholder="Mode of Transporter"
                value={dispatchThrough}
                onChange={(e) => setDispatchThrough(e.target.value)}
                className="border-gray-300 rounded-md p-3 border w-full"
                required
              />
            </div>
            <div className="col-span-1">
              <input
                type="text"
                placeholder="Third Party Name"
                value={deliveryTo}
                onChange={(e) => setDeliveryTo(e.target.value)}
                className="border-gray-300 rounded-md p-3 border w-full"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <input
                type="text"
                placeholder="Third Party Address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="border-gray-300 rounded-md p-3 border w-full"
              />
            </div>
            <div className="col-span-1 sm:col-span-2">
              <textarea
                name="itemNote"
                id="itemNote"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                className="w-full h-[40px] p-2 rounded-md"
                placeholder="Remark"
              ></textarea>
            </div>
          </div>


          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Confirm Your Order</h2>
            <p className="text-gray-600">Are you sure you want to place this order?</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 w-20"
              >
                Cancel
              </button>
              <button
                onClick={confirmOrder}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-20"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Order Successfully Placed</h2>
            <p className="text-gray-600">Your order has been placed successfully!</p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
