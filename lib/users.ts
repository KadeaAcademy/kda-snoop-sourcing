import useSWR from "swr";

import { hashPassword } from "./auth";
import { fetcher } from "./utils";

export enum UserRoles {
  Public = "PUBLIC",
  Admin = "ADMIN",
}

export const createUser = async (
  { firstname, lastname, gender, dob, address, phone, whatsapp, email, password },
  callbackUrl = ""
) => {
  const hashedPassword = await hashPassword(password);
  try {
    const res = await fetch(`/api/public/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callbackUrl,
        user: {
          firstname,
          lastname,
          gender,
          dob,
          address,
          phone,
          whatsapp,
          email,
          password: hashedPassword,
          profileIsValid: true,
        },
      }),
    });
    if (res.status !== 200) {
      const json = await res.json();

      throw Error(json.error);
    }
    return await res.json();
  } catch (error) {
    throw Error(`${error.message}`);
  }
};

export const createUserByUrl = async (
  { email, password = "kadea123" },
  callbackUrl = ""
) => {
  const hashedPassword = await hashPassword(password);
  try {
    const res = await fetch(`/api/public/users?email=${email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callbackUrl,
        user: {
          email,
          password: hashedPassword,
          profileIsValid: true,
        },
      }),
    });
    if (res.status !== 200) {
      const json = await res.json();

      throw Error(json.error);
    }
    return await res.json();
  } catch (error) {
    throw Error(`${error.message}`);
  }
};

export const resendVerificationEmail = async (email, callbackUrl) => {
  try {
    const res = await fetch(`/api/public/users/verification-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        callbackUrl,
      }),
    });
    if (res.status !== 200) {
      const json = await res.json();
      throw Error(json.error);
    }
    return await res.json();
  } catch (error) {
    throw Error(`${error.message}`);
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const res = await fetch(`/api/public/users/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
      }),
    });
    if (res.status !== 200) {
      const json = await res.json();
      throw Error(json.error);
    }
    return await res.json();
  } catch (error) {
    throw Error(`${error.message}`);
  }
};

export const resetPassword = async (id, password) => {
  const hashedPassword = await hashPassword(password);

  try {
    const res = await fetch(`/api/public/users/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: parseInt(id),
        hashedPassword,
      }),
    });
    if (res.status !== 200) {
      const json = await res.json();
      throw Error(json.error);
    }
    return await res.json();
  } catch (error) {
    throw Error(`${error.message}`);
  }
};

export const useUsers = () => {
  const { data, error, mutate } = useSWR(`/api/public/users`, fetcher);

  return {
    users: data,
    isLoadingUsers: !error && !data,
    isErrorUsers: error,
    mutateUsers: mutate,
  };
};

export const persistUserRole = async (data) => {
  try {
    await fetch(`/api/public/users/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.role),
    });
  } catch (error) {
    console.error(error);
  }
};

export const updateUserRole = async ({ id, role }) => {
  try {
    await fetch(`/api/users`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
  } catch (error) {
    console.error(error);
  }
};

export const updateUser = async (user, address) => {
  try {
    const data = await fetch(`/api/users/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, address }),
    });
    return data;
  } catch (error) {
    console.error(error);
  }
};