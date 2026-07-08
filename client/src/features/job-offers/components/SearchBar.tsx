import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Category {
  id: number;
  name: string;
}

interface SearchBarProps {
  categories: Category[];
  onSearch: (title: string, location: string, categoryId: string, skill: string, seniority: string) => void;
}

const SENIORITY_VALUES = ['', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e8e5df',
  borderRadius: 8,
  fontSize: 13,
  color: '#374151',
  background: '#f8f7f4',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s, background 0.15s',
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#9ca3af',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: 6,
};

export const SearchBar = ({ categories, onSearch }: SearchBarProps) => {
  const { t } = useTranslation();
  const seniorityLabels: Record<string, string> = {
    '': t('searchBar.allLevels'),
    JUNIOR: 'Junior',
    MID: 'Mid',
    SENIOR: 'Senior',
    LEAD: 'Lead',
  };
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [skill, setSkill] = useState('');
  const [seniority, setSeniority] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(title, location, categoryId, skill, seniority);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#0f1923';
    e.target.style.background = '#fff';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#e8e5df';
    e.target.style.background = '#f8f7f4';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <div>
        <label style={labelStyle}>{t('searchBar.position')}</label>
        <input
          type="text"
          placeholder={t('searchBar.positionPlaceholder')}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>{t('common.category')}</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">{t('searchBar.allCategories')}</option>
          {categories.map(cat => (
            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>{t('searchBar.skill')}</label>
        <input
          type="text"
          placeholder={t('searchBar.skillPlaceholder')}
          value={skill}
          onChange={e => setSkill(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>{t('searchBar.seniority')}</label>
        <select
          value={seniority}
          onChange={e => setSeniority(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          {SENIORITY_VALUES.map(value => (
            <option key={value} value={value}>{seniorityLabels[value]}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>{t('common.location')}</label>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">{t('searchBar.allPoland')}</option>
          <option value="Warszawa">Warszawa</option>
          <option value="Kraków">Kraków</option>
          <option value="Wrocław">Wrocław</option>
          <option value="Gdańsk">Gdańsk</option>
          <option value="Poznań">Poznań</option>
          <option value="Łódź">Łódź</option>
          <option value="Zdalnie">{t('searchBar.remote')}</option>
        </select>
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '10px',
          background: '#0f1923',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'background 0.15s',
          fontFamily: 'inherit',
          marginTop: 4,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1e3a5f')}
        onMouseLeave={e => (e.currentTarget.style.background = '#0f1923')}
      >
        {t('common.search')}
      </button>
    </form>
  );
};
