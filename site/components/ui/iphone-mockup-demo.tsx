import IPhoneMockup from '@/components/ui/iphone-mockup';
export default function DemoOne() {
  return <IPhoneMockup model="14" color="midnight" screenBg="#101014">
    <div style={{ color: 'white', fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto', padding: 16 }}>
      <h2 style={{ margin: 0 }}>Hello 👋</h2>
      <p style={{ opacity: .8 }}>This content respects safe areas.</p>
    </div>
  </IPhoneMockup>;
}
