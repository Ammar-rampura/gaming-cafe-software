import { PageHeader, Badge, Spinner } from '../components/ui'
import StationGrid from '../components/StationGrid'
import { useData } from '../context/DataContext'

export default function Stations() {
  const { loading, stations, stationStatus } = useData()
  if (loading) return <Spinner />
  const c = (k) => stations.filter((s) => stationStatus(s) === k).length
  return (
    <>
      <PageHeader title="Gaming Stations" sub="Tap Start on a free station, or End session on a busy one.">
        <Badge tone="green">{c('available')} available</Badge><Badge tone="violet">{c('occupied')} occupied</Badge><Badge tone="amber">{c('maintenance')} maintenance</Badge>
      </PageHeader>
      <h2 className="mb-3 font-display font-bold">PlayStation</h2>
      <StationGrid category="ps5" />
      <h2 className="mb-3 mt-8 font-display font-bold">Racing Simulators</h2>
      <StationGrid category="simulator" />
    </>
  )
}
