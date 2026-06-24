import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import WeddingEditForm from '../components/WeddingEditForm'
import CoupleProfileForm from '../components/CoupleProfileForm'
import ParentForm from '../components/ParentForm'
import { useWedding } from '../context/WeddingContext'
import { useCoupleProfiles } from '../hooks/useCoupleProfiles'
import { useParents } from '../hooks/useParents'

export default function ProfilPage() {
  const { wedding, updateWedding } = useWedding()
  const { byRole, saveProfile, loading: loadingCouple } = useCoupleProfiles()
  const { bySide, saveParent, loading: loadingParents } = useParents()

  if (!wedding) return null

  return (
    <>
      <div className="mb-2">
        <Link to="/more" className="text-sm text-burgundy-mid">← Kembali</Link>
      </div>
      <PageHeader title="Profil Pernikahan" subtitle="Edit data mempelai, tanggal & orang tua" />

      <div className="space-y-8">
        {/* Data pernikahan */}
        <WeddingEditForm wedding={wedding} onSave={updateWedding} />

        {/* Detail mempelai */}
        <section className="space-y-4">
          <h2 className="text-2xl">Data Mempelai</h2>
          {loadingCouple ? (
            <p className="card text-sm text-ink/50">Memuat…</p>
          ) : (
            <>
              <CoupleProfileForm
                key={`bride-${byRole('bride')?.id ?? 'new'}`}
                title="Mempelai Wanita"
                initial={byRole('bride')}
                onSave={(input) => saveProfile('bride', input)}
              />
              <CoupleProfileForm
                key={`groom-${byRole('groom')?.id ?? 'new'}`}
                title="Mempelai Pria"
                initial={byRole('groom')}
                onSave={(input) => saveProfile('groom', input)}
              />
            </>
          )}
        </section>

        {/* Orang tua */}
        <section className="space-y-4">
          <h2 className="text-2xl">Data Orang Tua</h2>
          {loadingParents ? (
            <p className="card text-sm text-ink/50">Memuat…</p>
          ) : (
            <>
              <ParentForm
                key={`bride-${bySide('bride')?.id ?? 'new'}`}
                title="Orang Tua Mempelai Wanita"
                initial={bySide('bride')}
                onSave={(input) => saveParent('bride', input)}
              />
              <ParentForm
                key={`groom-${bySide('groom')?.id ?? 'new'}`}
                title="Orang Tua Mempelai Pria"
                initial={bySide('groom')}
                onSave={(input) => saveParent('groom', input)}
              />
            </>
          )}
        </section>
      </div>
    </>
  )
}
