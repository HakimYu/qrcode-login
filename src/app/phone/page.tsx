"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiCog } from "@mdi/js";
import axios from "axios";
const BASE_URL = "http://192.168.100.100:8080"; // 修改为你的域名

const API_URLS = {
  login: `${BASE_URL}/login`,
};
export default function Phone() {
  const [userID, setUserID] = useState<string>(() => {
    return localStorage.getItem('userID') || '';
  });
  const searchParams = useSearchParams();
  const uuid = searchParams.get("uuid") as string | undefined;
  const ip = searchParams.get("ip") as string | undefined;
  useEffect(() => {
    const storedUserID = localStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID); // 从 localStorage 获取 userID
    }
  }, []); // 只在组件挂载时运行

  return (
    <>
      <SettingDialog />
      <div className="flex items-center justify-center min-h-screen">
        <PhoneCheck uuid={uuid} userID={userID} ip={ip} />
      </div>
    </>
  );
}

interface PhoneCheckProps {
  uuid: string | string[] | undefined;
  userID: string | number;
  ip: string | undefined;
}

const PhoneCheck: React.FC<PhoneCheckProps> = ({ uuid, userID,ip }) => {
  const [error, setError] = useState<boolean | null>(null); // error 状态类型
const [success, setSuccess] = useState<boolean | null>(null);
  const handleLogin = async () => {
    try {
      const response = await axios.post(API_URLS.login, {
        uuid: uuid,
        user_id: userID
      }, {
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = response.data;

      if (response.status !== 200) {
        console.error(data.message || "登录失败");
      } else {
        setSuccess(true);
        console.log("登录成功:", data);
      }
    } catch (err) {
      setError(true);
      console.error("登录错误:", err);
    }
  };

  return (
    <div className="flex items-center justify-center prose">
      <div className="card w-screen h-screen sm:w-96 sm:h-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        <div className="card-body item-center">
          <div className="flex justify-end"><SettingBtn /></div>
          {!success && <><h2 className="text-center mb-0">确认登录</h2>
            <p className="text-center max-h-10">IP：{ip}</p>
        <button className="btn btn-primary btn-block" onClick={handleLogin}>确认登录</button></>
        }
          {success && <h2 className="text-center mb-0">登录成功</h2>}
          {error && <p className="text-red-500 text-center">{error}</p>}

      </div>
      </div>
    </div>
  );
};


const SettingBtn = () => {
  return (
    <button className="btn btn-circle" onClick={() => {
      const dialog = document.getElementById("setting_dialog") as HTMLDialogElement;
      dialog.showModal();
    }}>
      <Icon path={mdiCog} size={1.3} />
    </button>
  );
};

const SettingDialog = () => {
  const [userID, setUserID] = useState<string>(() => {
    return localStorage.getItem('userID') || ''; // 如果 localStorage 中没有值，则默认为空字符串
  });
  useEffect(() => {
    localStorage.setItem('userID', userID);
  }, [userID]);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserID(event.target.value);
  };
  return (
    <dialog id="setting_dialog" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">设置UserID</h3>
        <label className="input input-bordered flex items-center gap-2 mt-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="h-4 w-4 opacity-70">
            <path
              d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
          </svg>
          <input type="text" className="grow" value={userID}
                 onChange={handleInputChange} placeholder="UserID" />
        </label>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn">确定</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};
