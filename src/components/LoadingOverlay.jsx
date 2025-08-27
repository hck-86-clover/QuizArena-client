import React from 'react';

export default function LoadingOverlay({ text='Loading...' }) {
  return (
    <div style={styles.backdrop}>
      <div style={styles.box}>
        <div className="spinner" style={styles.spinner} />
        <div>{text}</div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: { position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
  box: { background:'#fff', padding:'24px 32px', borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', gap:12, fontWeight:500, fontSize:16, minWidth:200 },
  spinner: { width:32, height:32, border:'4px solid #dbeafe', borderTopColor:'#2563eb', borderRadius:'50%', animation:'spin 1s linear infinite' }
};
