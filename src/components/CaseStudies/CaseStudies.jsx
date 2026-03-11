import styles from './CaseStudies.module.css';
import avatarImg from '../../assets/hero/mainImg.png';

const CASE_STUDIES = [
  {
    key: 'payza',
    title: 'PAYZA',
    description:
      'Designing a communication platform that helps people safely connect in the blockchain space by protecting them from scams and wallet hacks, while making conversations simpler and easier than on existing platforms.',
    theme: 'light',
  },
  {
    key: 'garnerly',
    title: 'GARNERLY',
    description:
      'Designing a fintech platform that helps African residents easily receive international payments, send invoices, and manage multi-currency accounts to work and get paid globally.',
    theme: 'dark',
  },
  {
    key: 'journow',
    title: 'JOURNOW',
    description:
      'Designing a mobile app that helps people easily capture their ideas, thoughts, and experiences, making journaling simpler for users who want to document important moments in their lives.',
    theme: 'mobile',
  },
  {
    key: 'axiom',
    title: 'AXIOM',
    description:
      'Designing a fintech app that helps users grow their wealth by saving, investing in real estate opportunities, and easily tracking their investments in one place.',
    theme: 'mobile2',
  },
];

function CaseStudyCard({ title, theme }) {
  return (
    <div className={styles.card} data-theme={theme} aria-hidden="true">
      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <div className={styles.cardLogo} />
          <div className={styles.cardSearch} />
          <div className={styles.cardChip} />
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardMockTitle}>{title}</div>
          <div className={styles.cardMockRow} />
          <div className={styles.cardMockRow} />
          <div className={styles.cardMockRow} />
        </div>
      </div>
    </div>
  );
}

export default function CaseStudies() {
  return (
    <section className={styles.section} aria-label="Case studies">
      <header className={styles.topBar}>
        <div className={styles.avatarWrap}>
          <img className={styles.avatar} src={avatarImg} alt="" />
        </div>
        <button className={styles.menuButton} type="button">
          <span className={styles.menuIcon} aria-hidden="true" />
          <span className={styles.menuText}>Menu</span>
        </button>
      </header>

      <div className={styles.list}>
        {CASE_STUDIES.map((item, idx) => (
          <article className={styles.item} key={item.key}>
            <div className={styles.itemLeft}>
              <div
                className={styles.stickyWrap}
                style={{
                  '--stack-index': idx,
                }}
              >
                <CaseStudyCard title={item.title} theme={item.theme} />
              </div>
            </div>
            <div className={styles.itemRight}>
              <h2 className={styles.title}>{item.title}</h2>
              <p className={styles.description}>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

