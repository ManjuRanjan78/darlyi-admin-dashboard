import { useParams } from "react-router-dom";
import UserEarningStats from "./UserEarningStats";
import UserCoinHistory from "./UserCoinHistory";
import BuyerCoinStats from "./BuyerCoinStats";

export default function CoinsHistory() {
  const { id } = useParams();
  return (
    <div className=" flex-1 bg-slate-800/20 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-xl min-h-screen">
      <div className=" p-4 rounded-xl shadow-md flex flex-col gap-4">
        {/* <div className="flex flex-wrap items-center justify-between gap-4 mb-4"></div> */}

        <UserEarningStats userId={id} />
        <div className="mt-5">
          <UserCoinHistory userId={id} />
        </div>
        <div className="">
         <BuyerCoinStats userId={id} />
        </div>
      </div>
    </div>
  );
}
