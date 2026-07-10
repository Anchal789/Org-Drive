import HeroPanel from '@/components/authPages/HeroPanel';
import LoginForm from '@/components/authPages/LoginForm';
import styles from '@/components/authPages/LoginPage.module.scss';

export default function LoginPage() {
  return (
    <div className={styles.authPage}>
      <HeroPanel />

      <div className={styles.formSectionWrapper}>
        <LoginForm />
      </div>
    </div>
  );
}
