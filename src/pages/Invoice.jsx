import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import togiloImg from "../assets/signupImage.png";
import flirtyImg from "../assets/flirtyvoices.png";
// eslint-disable-next-line react/display-name
const Invoice = React.forwardRef((props, ref) => {
  const { userId, invData,app } = props;
  function formatDateTime(isoString) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    const formattedTime = `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;

    return formattedTime;
  }
  const baseAmount = (invData?.amount * 100) / (100 + 18);
  const gstAmount = invData?.amount - baseAmount;
  const cgst = baseAmount * 0.09;
  const sgst = baseAmount * 0.09;
function numberToRupeesWords(amount) {
  if (amount === 0) return "Rupees Zero Only";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five",
    "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const scales = [
    { value: 10000000, name: "Crore" },
    { value: 100000, name: "Lakh" },
    { value: 1000, name: "Thousand" },
    { value: 100, name: "Hundred" }
  ];

  function convertBelowThousand(num) {
    let str = "";

    if (num >= 100) {
      str += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }

    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }

    if (num > 0) {
      str += ones[num] + " ";
    }

    return str.trim();
  }

  let num = Math.floor(amount);
  let words = "";

  for (let i = 0; i < scales.length; i++) {
    const { value, name } = scales[i];
    if (num >= value) {
      const scaleNum = Math.floor(num / value);
      words += convertBelowThousand(scaleNum) + " " + name + " ";
      num %= value;
    }
  }

  if (num > 0) {
    words += convertBelowThousand(num) + " ";
  }

  words = words.trim();

  return `${words} ${invData?.amountType==="USD"?"Dollars":"Rupees"}  Only`;
}
const symbol=invData?.amountType==="USD"?"$":"₹"
  return (
    <div
      ref={ref}
      className="max-w-[800px] mx-auto bg-white p-4 md:p-8 rounded-lg  text-sm"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold uppercase">Tax Invoice</h1>
        <div className="flex items-center justify-center mt-4"><img src={app==="flirty"?flirtyImg:togiloImg} alt="" className={`${app==="flirty"?"h-14 w-16":"h-10 w-16"}`}/></div>
        <h2 className="text-lg text-gray-600">{app==="flirty"?"Flirty Voices":"Togilo"}</h2>
      </div>

      {/* Seller Details */}
      <div className="text-sm mb-4">
        <p className="font-bold uppercase mb-1">Seller Details</p>
        <p className="font-semibold">Hikizo Private Limited</p>
        <p>
          Address: 552, 2nd Floor 16th Main, 15th Cross Rd, 4th Sector, <br />
          HSR Layout, Bengaluru, Karnataka 560102
        </p>
        <p>GSTIN: 29AAFCH2467J1Z8</p>
        <p>HSN Code: 998439</p>
        <p>Invoice #: {userId}</p>
      </div>

      {/* Customer Details */}
      <div className="text-sm mb-4">
        <p className="font-bold uppercase mb-1">Customer Details</p>
        <p>Name: {invData?.userId?.name}</p>
      </div>

      {/* Transaction Details */}
      <div className="text-sm mb-4">
        <p className="font-bold uppercase mb-1">Transaction Details</p>
        <p>Transaction Date & Time: {formatDateTime(invData?.createdAt)}</p>
        <p>Transaction ID: {invData?.transactionDetails}</p>
        <p>Mode of Payment: UPI</p>
        {/* <p>Place of Supply: Karnataka, India</p> */}
      </div>

      {/* Items */}
      <table className="w-full border border-gray-300 text-sm mb-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 pb-4 text-left">Description</th>
            <th className="border px-3 pb-4 text-right">Amount ({symbol})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-3 pb-4">Coins Purchase</td>
            <td className="border px-3 pb-4 text-right">
             {symbol}{invData?.pricingId?.price}.00
            </td>
          </tr>
          <tr>
            <td className="border px-3 pb-4">Discount</td>
            <td className="border px-3 pb-4 text-right">
              -{symbol}{invData?.pricingId?.price - invData?.pricingId?.offerPrice}.00
            </td>
          </tr>
          <tr>
            <td className="border px-3 pb-4 font-semibold">
              Net Amount (Incl. GST)
            </td>
            <td className="border px-3 pb-4 text-right font-semibold">
              {symbol}{invData?.amount}.00
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tax */}
      <table className="w-full text-sm mb-4">
        <tbody>
          <tr>
            <td>Total Taxable Value</td>
            <td className="text-right">
              {symbol}{(invData?.amount - (sgst + cgst)).toFixed(2)}
            </td>
          </tr>
          <tr>
            <td>SGST (9%)</td>
            <td className="text-right">{symbol}{sgst.toFixed(2)}</td>
          </tr>
          <tr>
            <td>CGST (9%)</td>
            <td className="text-right">{symbol}{cgst.toFixed(2)}</td>
          </tr>
          <tr className="font-bold">
            <td>Grand Total</td>
            <td className="text-right">{symbol}{invData?.amount}.00</td>
          </tr>
        </tbody>
      </table>

      {/* Footer */}
      <p className="text-sm mb-6">Amount in Words: {numberToRupeesWords(invData?.amount)}</p>

      <div className="text-right text-sm">
        <p className="font-bold">For Hikizo Private Limited</p>
        <p className="mt-8">Authorised Signatory</p>
      </div>
      <div className="mt-3 text-[10.5px] text-gray-700 leading-[1.2]">
  <p>
    Refer to <span className="underline">{app==="flirty"?"flirtyvoices.com/privacy-policy":"togilo.com/privacy-policy"}</span> for Policy, Terms
    &amp; Conditions.
  </p>
  <p>Tax payable on reverse charge – No.</p>
  <p>
    *In case of inter-state supply IGST will be applicable. Within state
    supplies are liable for CGST &amp; SGST.
  </p>
</div>

    </div>
  );
});

export default Invoice;
