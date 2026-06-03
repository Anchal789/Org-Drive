"use client";

import Image from "next/image";
import { useRef } from "react";
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

type Country = (typeof countryWithPhoneCode)[number];

const flagSrc = (code: string) =>
  `https://raw.githubusercontent.com/SujalXplores/All-Country-Flags/refs/heads/master/${code}.png`;

const DEFAULT_COUNTRY =
  countryWithPhoneCode.find((c) => c.code === "IN") ?? countryWithPhoneCode[0];

export default function PhoneLogin() {
  const phoneRef = useRef("");
  const dialCodeRef = useRef(DEFAULT_COUNTRY.phoneCode);
  const navigate = useRouter();

  const fullNumber = () =>
    `${dialCodeRef.current}${phoneRef.current}`.replace(/\s/g, "");

  const handleRequestOtp = async () => {
    const data = await requestOtp(fullNumber());

    if (data.success) {
      toast.success("OTP sent successfully");
      navigate.push(`/verify-otp?phone=${encrypt(fullNumber())}`);
    } else {
      toast.error(data.error);
    }
  };

  return (
    <>
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
            itemToStringLabel={(c: Country) => c.name}
            itemToStringValue={(c: Country) => c.code}
            onValueChange={(c: Country | null) => {
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
                {(c: Country | null) =>
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

          <Input
            type="tel"
            onChange={(e) => (phoneRef.current = e.target.value)}
            placeholder="347 821 4498"
            style={{
              border: "none",
              boxShadow: "none",
              marginLeft: 10,
            }}
          />
        </div>

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

      <TelegramButton onClick={handleRequestOtp}>
        Send code on Telegram
      </TelegramButton>
    </>
  );
}
