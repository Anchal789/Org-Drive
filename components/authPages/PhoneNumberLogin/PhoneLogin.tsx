'use client';

import { Shield } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item';
import TelegramButton from '@/components/ui/telegram-button';
import { countryWithPhoneCode } from '@/constants/country-with-phonecode';
import { encrypt } from '@/lib/utils';
import { requestOtp } from '@/services/auth-service';
import type { CountryType } from '@/types/auth';
import styles from './PhoneLogin.module.scss';

const flagSrc = (code: string) =>
  `https://raw.githubusercontent.com/SujalXplores/All-Country-Flags/refs/heads/master/${code}.png`;

const DEFAULT_COUNTRY =
  countryWithPhoneCode.find((c) => c.code === 'IN') ?? countryWithPhoneCode[0];

const fullNumber = (dialCode: string, phoneNumber?: string) =>
  `${dialCode}${phoneNumber}`.replace(/\s/g, '');

const itemToStringLabel = (c: CountryType) => c.name;
const itemToStringValue = (c: CountryType) => c.code;
const renderComboboxValue = (c: CountryType | null) =>
  c ? (
    <span className={styles.flagWrapper}>
      <Image
        src={flagSrc(c.code)}
        alt={c.name}
        width={16}
        height={16}
        className={styles.flagIcon}
      />
      {c.phoneCode}
    </span>
  ) : null;

export default function PhoneLogin() {
  const router = useRouter();

  const {
    formState: { isValid, errors, isSubmitting },
    control,
    handleSubmit,
    setValue,
  } = useForm<{ phoneNumber: string; dialCode: string }>({
    defaultValues: {
      phoneNumber: '',
      dialCode: DEFAULT_COUNTRY.phoneCode,
    },
    mode: 'onChange',
  });

  const onSubmit = async (payload: {
    phoneNumber: string;
    dialCode: string;
  }) => {
    if (!isValid) return;

    const targetNumber = fullNumber(payload.dialCode, payload.phoneNumber);
    const data = await requestOtp(targetNumber);

    if (data.success) {
      toast.success('OTP sent successfully');
      router.push(`/verify-otp?phone=${encrypt(targetNumber)}`);
    } else {
      toast.error(
        typeof data.error === 'string' ? data.error : 'Failed to send OTP',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.formWrapper}>
      <div>
        <label htmlFor='phoneNumber' className={styles.label}>
          Phone number
        </label>

        <div className={styles.inputGroup}>
          <Combobox
            items={countryWithPhoneCode.filter((c) => c.code !== '')}
            defaultValue={DEFAULT_COUNTRY}
            itemToStringLabel={itemToStringLabel}
            itemToStringValue={itemToStringValue}
            onValueChange={(c: CountryType | null) => {
              setValue('dialCode', c?.phoneCode ?? '');
            }}
          >
            <ComboboxTrigger className={styles.comboboxTrigger}>
              <ComboboxValue>{renderComboboxValue}</ComboboxValue>
            </ComboboxTrigger>

            <ComboboxContent className={styles.comboboxContent}>
              <ComboboxInput
                placeholder='Search countries...'
                showTrigger={false}
                className={styles.comboboxSearch}
              />

              <ComboboxEmpty>No countries found.</ComboboxEmpty>

              <ComboboxList>
                {(country) => (
                  <ComboboxItem key={country.code} value={country}>
                    <Item size='xs' className={styles.listItem}>
                      <ItemContent className={styles.listContent}>
                        <Image
                          src={flagSrc(country.code)}
                          alt={country.name}
                          width={16}
                          height={16}
                          className={styles.flagIcon}
                        />

                        <span>
                          <ItemTitle className={styles.listTitle}>
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
            name='phoneNumber'
            rules={{
              required: 'Phone number is required',
              minLength: {
                value: 10,
                message: 'Phone number must be at least 10 characters',
              },
              maxLength: {
                value: 15,
                message: 'Phone number must be at most 15 characters',
              },
            }}
            render={({ field }) => (
              <Input
                {...field}
                onChange={(event) => {
                  const value = event.target.value
                    .replace(/\D/g, '')
                    .slice(0, 15);
                  field.onChange(value);
                }}
                className={styles.phoneInput}
                placeholder='347 821 4498'
              />
            )}
          />
        </div>

        {errors.phoneNumber && (
          <p className={styles.errorText}>{errors.phoneNumber.message}</p>
        )}

        <div className={styles.shieldHint}>
          <Shield size={11} />
          We never see your messages. Telegram handles the OTP.
        </div>
      </div>

      <TelegramButton
        loading={isSubmitting}
        loadingText='Sending code...'
        type='submit'
        className={styles.submitButton}
      >
        Send code on Telegram
      </TelegramButton>
    </form>
  );
}
