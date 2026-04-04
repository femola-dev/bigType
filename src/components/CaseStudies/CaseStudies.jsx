import styles from './CaseStudies.module.css';
import avatarImg from '../../assets/hero/mainImg.png';
import menuIcon from '../../assets/Menu Icon.svg';

import payzaScreen from '../../assets/Payza Screen.svg';
import garnerlyScreen from '../../assets/Garnerly  Screen.svg';
import journowScreen from '../../assets/Journow  Screen.png';
import axiomScreen from '../../assets/Axiom  Screen.png';

const CASE_STUDIES = [
  {
    key: 'payza',
    title: 'PAYZA',
    description:
      'Designing a communication platform that helps people safely connect in the blockchain space by protecting them from scams and wallet hacks, while making conversations simpler and easier than on existing platforms.',
    screen: payzaScreen,
  },
  {
    key: 'garnerly',
    title: 'GARNERLY',
    description:
      'Designing a fintech platform that helps African freelancers easily receive international payments, send invoices, and manage multi-currency accounts to work and get paid globally.',
    screen: garnerlyScreen,
  },
  {
    key: 'journow',
    title: 'JOURNOW',
    description:
      'Designing a mobile app that helps people easily capture their ideas, thoughts, and experiences, making journaling simple for users who want to document important moments in their lives.',
    screen: journowScreen,
  },
  {
    key: 'axiom',
    title: 'AXIOM',
    description:
      'Designing a fintech app that helps users grow their wealth by saving, investing in real estate opportunities, and easily tracking their investments in one place.',
    screen: axiomScreen,
  },
];

export default function CaseStudies({
  sectionRef = null,
  logoRef = null,
  headerProgress = 1,
  hideAvatar = false,
}) {
  return (
    <section ref={sectionRef} className={styles.section} aria-label="Case studies">
      <header
        className={styles.topBar}
        style={{
          opacity: headerProgress,
          pointerEvents: headerProgress > 0.95 ? 'auto' : 'none',
        }}
      >
        <div className={styles.topBarInner}>
          <div
            ref={logoRef}
            className={styles.avatarWrap}
            style={{ opacity: hideAvatar ? 0 : 1 }}
          >
            <img className={styles.avatar} src={avatarImg} alt="" />
          </div>
          <button className={styles.menuButton} type="button">
            <img className={styles.menuIcon} src={menuIcon} alt="" aria-hidden="true" />
            <span className={styles.menuText}>Menu</span>
          </button>
        </div>
      </header>

      <div className={styles.list}>
        {CASE_STUDIES.map((item, idx) => (
          <div
            key={item.key}
            className={styles.stickyWrap}
            style={{ '--stack-index': idx }}
            role="article"
          >
            <div className={styles.cardGroup}>
              <div className={styles.cardHeaderLine} aria-hidden="true" />
              <div className={styles.card}>
              <div className={styles.cardLeft}>
                <img
                  className={styles.cardImage}
                  src={item.screen}
                  alt={`${item.title} case study`}
                />
              </div>
              <div className={styles.cardRight}>
                <h2 className={styles.title}>{item.title}</h2>
                <p className={styles.description}>{item.description}</p>
              </div>
            </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
