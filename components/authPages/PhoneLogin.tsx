"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import Icon from "@/components/ui/Icon";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import TelegramButton from "@/components/ui/TelegramButton";
import { iconsWithPaths } from "@/constants/common-constants";
import { countryWithPhoneCode } from "@/constants/country-with-phonecode";
import { requestOtp } from "@/services/auth-service";
import { useRouter } from "next/navigation";
import { encrypt } from "@/lib/utils";
import { CountryType } from "@/types/auth";
import { Controller, useForm } from "react-hook-form";
import { Route } from "next";

const flagSrc = (code: string) =>
  `https://raw.githubusercontent.com/SujalXplores/All-Country-Flags/refs/heads/master/${code}.png`;

const DEFAULT_COUNTRY =
  countryWithPhoneCode.find((c) => c.code === "IN") ?? countryWithPhoneCode[0];

export default function PhoneLogin() {
  const [loading, setLoading] = useState<boolean>(false);
  const dialCodeRef = useRef<string>(DEFAULT_COUNTRY.phoneCode);
  const navigate = useRouter();

  const {
    formState: { isValid, errors },
    control,
    handleSubmit,
  } = useForm<{ phoneNumber: string }>({
    defaultValues: {
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const fullNumber = (phoneNumber?: string) =>
    `${dialCodeRef.current}${phoneNumber}`.replace(/\s/g, "");

  const onSubmit = async (payload: { phoneNumber: string }) => {
    setLoading(true);
    const data = await requestOtp(fullNumber(payload.phoneNumber));
    if (!isValid) return;
    if (data.success) {
      toast.success("OTP sent successfully");

      navigate.push(
        `/verify-otp?phone=${encrypt(fullNumber(payload.phoneNumber))}`,
      );
    } else {
      toast.error(data.error);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--foreground)",
            marginBottom: 6,
            display: "block",
          }}
        >
          Phone number
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid transparent",
            outlineColor: "var(--tg-blue)",
            transition: "all 150ms ease",
            boxShadow: "oklch(0.708 0 0 / 0.25) 0px 0px 0px 3px",
          }}
        >
          <Combobox
            items={countryWithPhoneCode.filter((c) => c.code !== "")}
            defaultValue={DEFAULT_COUNTRY}
            itemToStringLabel={(c: CountryType) => c.name}
            itemToStringValue={(c: CountryType) => c.code}
            onValueChange={(c: CountryType | null) => {
              dialCodeRef.current = c?.phoneCode ?? "";
            }}
          >
            <ComboboxTrigger
              style={{
                height: 42,
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 0,
                border: 0,
                borderRight: "1px solid var(--border)",
                background: "transparent",
                padding: "0 10px",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <ComboboxValue>
                {(c: CountryType | null) =>
                  c ? (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Image
                        src={flagSrc(c.code)}
                        alt={c.name}
                        width={16}
                        height={16}
                        style={{
                          flexShrink: 0,
                          borderRadius: 2,
                        }}
                      />
                      {c.phoneCode}
                    </span>
                  ) : null
                }
              </ComboboxValue>
            </ComboboxTrigger>

            <ComboboxContent
              style={{
                width: 288,
                background: "#fff",
              }}
            >
              <ComboboxInput
                placeholder="Search countries..."
                showTrigger={false}
                style={{
                  borderRadius: 0,
                  border: 0,
                  borderBottom: "1px solid var(--border)",
                  boxShadow: "none",
                  outline: "none",
                }}
              />

              <ComboboxEmpty>No countries found.</ComboboxEmpty>

              <ComboboxList>
                {(country) => (
                  <ComboboxItem key={country.code} value={country}>
                    <Item
                      size="xs"
                      style={{
                        padding: 0,
                      }}
                    >
                      <ItemContent
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <Image
                          src={flagSrc(country.code)}
                          alt={country.name}
                          width={16}
                          height={16}
                          style={{
                            flexShrink: 0,
                            borderRadius: 2,
                          }}
                        />

                        <span>
                          <ItemTitle
                            style={{
                              whiteSpace: "nowrap",
                            }}
                          >
                            {country.name}
                          </ItemTitle>

                          <ItemDescription>{country.phoneCode}</ItemDescription>
                        </span>
                      </ItemContent>
                    </Item>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Controller
            control={control}
            name="phoneNumber"
            rules={{
              required: "Phone number is required",
              minLength: {
                value: 10,
                message: "Phone number must be at least 10 characters",
              },
              maxLength: {
                value: 15,
                message: "Phone number must be at most 15 characters",
              },
            }}
            render={({ field }) => (
              <Input
                value={field.value}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 15);
                  field.onChange(value);
                }}
                style={{
                  border: "none",
                  boxShadow: "none",
                  marginLeft: 10,
                }}
                placeholder="347 821 4498"
              />
            )}
          />
        </div>
        {errors.phoneNumber && (
          <p
            style={{
              fontSize: 11,
              color: "var(--destructive)",
              marginTop: 6,
            }}
          >
            {errors.phoneNumber.message}
          </p>
        )}

        <div
          style={{
            fontSize: 11,
            color: "var(--muted-foreground)",
            marginTop: 6,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon d={iconsWithPaths.shield} size={11} />
          We never see your messages. Telegram handles the OTP.
        </div>
      </div>

      <TelegramButton
        loading={loading}
        loadingText="Sending code..."
        type="submit"
      >
        Send code on Telegram
      </TelegramButton>
    </form>
  );
}
