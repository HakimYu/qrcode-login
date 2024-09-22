"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

const BASE_URL = "http://localhost:8080"; // 修改为你的域名

const API_URLS = {
  fetchQRCode: `${BASE_URL}/getqrcode`,
  checkUUID: `${BASE_URL}/checkuuid`
};

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <QRLogin />
    </div>
  );
}

const QRLogin = () => {
  const [uuid, setUuid] = useState<string>("");
  const [QRCode, setQRCode] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const fetchQRCode = async () => {
    try {
      const response = await axios.get(API_URLS.fetchQRCode, {
        responseType: "arraybuffer"
      });
      const base64Image = Buffer.from(response.data, "binary").toString("base64");
      setUuid(response.headers["uuid"]);
      console.log("uuid",response.headers.uuid);
      setQRCode(`data:image/png;base64,${base64Image}`);
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }
  };
  useEffect(() => {
    fetchQRCode();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!QRCode) return;

      try {
        const response = await axios.post(API_URLS.checkUUID, { uuid });
        console.log("checkUUID response", response.data);
        if (response.data.success) {
          setIsLoggedIn(true);
          setUserId(response.data.user_id);
          clearInterval(interval); // 登录成功后停止轮询
        } else {
          if (response.data.message === "expired"|| response.data.message === "notfound") {
            console.error("uuid expired");
            await fetchQRCode();
          }
        }
      } catch (error) {
        console.error("Error checking UUID:", error);
      }
    }, 3000); // 每3秒检查一次

    return () => clearInterval(interval); // 清理副作用
  }, [QRCode,uuid]);

  return (
    <div className="flex items-center justify-center prose">
      <div className="card w-screen h-screen sm:w-96 sm:h-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl">
        <div className="card-body items-center">
          <h2 className="text-center mb-0">扫码登录</h2>
          <p className="text-center max-h-10">请使用手机扫描二维码登录</p>
          <div className="flex justify-center">
            <Image
              src={QRCode}
              alt="二维码"
              width="200"
              height="200"
              className="rounded-lg"
            />
          </div>
          {isLoggedIn && (
            <div className="text-center mt-4">
              <p>登录成功！用户ID: {userId}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
