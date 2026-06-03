'use client';
import { useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import Icon from '@/components/ui/Icon';
import { iconsWithPaths } from '@/constants/common-constants';
import { countryWithPhoneCode } from '@/constants/country-with-phonecode';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import { Input } from '@/components/ui/input';
import { requestOtp } from '@/services/auth-service';
import TelegramButton from '@/components/ui/TelegramButton';

type Country = (typeof countryWithPhoneCode)[number];

const flagSrc = (code: string) =>
  `https://raw.githubusercontent.com/SujalXplores/All-Country-Flags/refs/heads/master/${code}.png`;

const DEFAULT_COUNTRY =
  countryWithPhoneCode.find((c) => c.code === 'IN') ?? countryWithPhoneCode[0];

export default function PhoneLogin() {
  const phoneRef = useRef('');
  const dialCodeRef = useRef(DEFAULT_COUNTRY.phoneCode);

  const fullNumber = () =>
    `${dialCodeRef.current}${phoneRef.current}`.replace(/\s/g, '');

  const handleRequestOtp = async () => {
    const data = await requestOtp(fullNumber());

    if (data.success) {
      toast.success('OTP sent!');
    } else {
      toast.error(data.error);
    }
  };

  return (
    <>
      <div>
        <p className="text-[11px] font-medium text-foreground mb-1.5 block">
          Phone number
        </p>
        <div
          className="flex items-center rounded-md overflow-hidden border border-solid border-transparent focus-within:border focus-within:border-tg-blue transition-shadow outline-tg-blue"
          style={{ boxShadow: 'oklch(0.708 0 0 / 0.25) 0px 0px 0px 3px' }}
        >
          <Combobox
            items={countryWithPhoneCode.filter((c) => c.code !== '')}
            defaultValue={DEFAULT_COUNTRY}
            itemToStringLabel={(c: Country) => c.name}
            itemToStringValue={(c: Country) => c.code}
            onValueChange={(c: Country | null) => {
              dialCodeRef.current = c?.phoneCode ?? '';
            }}
          >
            <ComboboxTrigger className="h-10.5 flex items-center gap-1.5 rounded-none border-0 border-r border-border bg-transparent px-2.5 py-0 text-[13px] font-medium [&_svg]:size-2.75 [&_svg]:text-muted-foreground">
              <ComboboxValue>
                {(c: Country | null) =>
                  c ? (
                    <span className="flex items-center gap-1.5">
                      <Image
                        src={flagSrc(c.code)}
                        alt={c.name}
                        width={16}
                        height={16}
                        className="shrink-0 rounded-sm"
                      />
                      {c.phoneCode}
                    </span>
                  ) : null
                }
              </ComboboxValue>
            </ComboboxTrigger>

            <ComboboxContent className="w-72 bg-white">
              <ComboboxInput
                placeholder="Search countries..."
                showTrigger={false}
                className="rounded-none border-0 border-b border-border shadow-none focus-within:ring-0 [&_input]:outline-none [&_input]:focus-visible:ring-0 [&_input]:focus-visible:outline-none"
              />
              <ComboboxEmpty>No countries found.</ComboboxEmpty>
              <ComboboxList>
                {(country) => (
                  <ComboboxItem key={country.code} value={country}>
                    <Item size="xs" className="p-0">
                      <ItemContent className="flex flex-row items-center gap-2.5">
                        <Image
                          src={flagSrc(country.code)}
                          alt={country.name}
                          width={16}
                          height={16}
                          className="shrink-0 rounded-sm"
                        />
                        <span>
                          <ItemTitle className="whitespace-nowrap">
                            {country.name}
                          </ItemTitle>
                          <ItemDescription>
                            +{country.phoneCode}
                          </ItemDescription>
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
            className="border-none focus-visible:ring-0"
          />
        </div>
        <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1.5">
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
