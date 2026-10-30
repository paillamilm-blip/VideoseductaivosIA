// High-precision mathematical and physics animation renderers for HTML5 Canvas

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number; // in seconds
  params: Record<string, number>;
  interactive?: boolean;
}

// Helper: draw grid background
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing = 40,
  gridColor = 'rgba(51, 65, 85, 0.25)'
) {
  ctx.save();
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += spacing) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += spacing) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();
  ctx.restore();
}

// 1. Math Fourier Epicycles and Waveform Synthesis
export function renderFourier(rc: RenderContext) {
  const { ctx, width, height, time, params } = rc;
  const harmonics = Math.max(1, Math.min(15, Math.round(params.harmonicsCount ?? 5)));
  const baseFreq = params.fundamentalFreq ?? 0.5;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, width, height, 40);

  const centerX = width * 0.28;
  const centerY = height * 0.5;
  const baseRadius = Math.min(width, height) * 0.22;

  let prevX = centerX;
  let prevY = centerY;

  ctx.save();
  // Draw epicycles
  for (let n = 0; n < harmonics; n++) {
    const k = 2 * n + 1; // Square wave odd harmonics
    const radius = baseRadius * (4 / (k * Math.PI));
    const angle = k * (time * baseFreq * 2 * Math.PI);

    const nextX = prevX + radius * Math.cos(angle);
    const nextY = prevY - radius * Math.sin(angle);

    // Epicycle circle
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 - n * 0.05})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Radius vector
    ctx.strokeStyle = n === 0 ? '#38bdf8' : '#818cf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(nextX, nextY);
    ctx.stroke();

    // Node dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(nextX, nextY, 3, 0, Math.PI * 2);
    ctx.fill();

    prevX = nextX;
    prevY = nextY;
  }

  // Draw connecting laser pointer to wave domain
  const waveStartX = width * 0.52;
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(waveStartX, prevY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Plot synthesized wave over time window
  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
  ctx.shadowBlur = 8;

  const pointsCount = 200;
  const waveWidth = width * 0.44;
  for (let i = 0; i < pointsCount; i++) {
    const x = waveStartX + (i / pointsCount) * waveWidth;
    const tOffset = (i / pointsCount) * (2 / baseFreq);
    const evalTime = time - tOffset;

    let ySum = 0;
    for (let n = 0; n < harmonics; n++) {
      const k = 2 * n + 1;
      const radius = baseRadius * (4 / (k * Math.PI));
      const angle = k * (evalTime * baseFreq * 2 * Math.PI);
      ySum += radius * Math.sin(angle);
    }
    const y = centerY - ySum;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Wave origin indicator
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(waveStartX, prevY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Axis and telemetry info
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText(`Armónicos: N = ${harmonics}`, 24, 30);
  ctx.fillText(`f₀ = ${baseFreq.toFixed(2)} Hz`, 24, 48);
  ctx.fillText('Dominio Temporal y(t) = ∑ bₖ sin(kωt)', waveStartX, 30);

  ctx.restore();
}

// 2. Math Riemann Integration Sums
export function renderRiemann(rc: RenderContext) {
  const { ctx, width, height, time, params } = rc;
  const n = Math.max(3, Math.min(80, Math.round(params.subdivisions ?? 8)));

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, width, height, 40);

  const originX = width * 0.12;
  const originY = height * 0.78;
  const scaleX = (width * 0.78) / 6;
  const scaleY = (height * 0.6) / 4;

  const f = (x: number) => {
    // Dynamic smooth math function
    const phase = time * 0.6;
    return Math.sin(x + phase * 0.4) * 0.9 + Math.cos(0.5 * x) * 0.6 + 2.0;
  };

  const a = 0.5;
  const b = 5.5;
  const dx = (b - a) / n;

  ctx.save();
  // Draw Riemann rectangles
  let totalArea = 0;
  for (let i = 0; i < n; i++) {
    const xSample = a + i * dx + dx * 0.5; // Midpoint rule
    const heightVal = f(xSample);
    const rectArea = heightVal * dx;
    totalArea += rectArea;

    const rx = originX + (a + i * dx) * scaleX;
    const rw = dx * scaleX;
    const rh = heightVal * scaleY;
    const ry = originY - rh;

    // Fill rectangle with semi-transparent cyan
    ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
    ctx.fillRect(rx, ry, rw, rh);

    // Border of rectangle
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(rx, ry, rw, rh);
  }

  // Draw continuous smooth function f(x)
  ctx.beginPath();
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
  ctx.shadowBlur = 10;
  for (let px = 0; px <= 6; px += 0.05) {
    const cx = originX + px * scaleX;
    const cy = originY - f(px) * scaleY;
    if (px === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Axes
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(originX - 10, originY);
  ctx.lineTo(originX + 6 * scaleX + 20, originY);
  ctx.moveTo(originX, originY + 10);
  ctx.lineTo(originX, originY - 4 * scaleY - 20);
  ctx.stroke();

  // Integral bounds markers
  ctx.fillStyle = '#f8fafc';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText('a', originX + a * scaleX - 4, originY + 20);
  ctx.fillText('b', originX + b * scaleX - 4, originY + 20);

  // Area readout
  ctx.fillStyle = '#38bdf8';
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillText(`Particiones: N = ${n}`, 24, 32);
  ctx.fillText(`Δx = ${(dx).toFixed(3)}`, 24, 52);
  ctx.fillText(`Suma de Riemann ≈ ${totalArea.toFixed(4)}`, 24, 72);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('lim (N → ∞) ∑ f(xᵢ*)Δx = ∫ₐᵇ f(x) dx', 24, 94);

  ctx.restore();
}

// 3. Math Matrix Transformations 2D
export function renderMatrixTransform(rc: RenderContext) {
  const { ctx, width, height, time, params } = rc;
  const a = params.matrixA ?? 1.2;
  const b = params.matrixB ?? 0.5;
  const c = params.matrixC ?? -0.3;
  const d = params.matrixD ?? 1.1;

  // Interpolate transformation smoothly
  const tInterp = Math.min(1, (Math.sin(time * 0.8) + 1) / 2);
  const curA = 1 + (a - 1) * tInterp;
  const curB = 0 + b * tInterp;
  const curC = 0 + c * tInterp;
  const curD = 1 + (d - 1) * tInterp;
  const det = curA * curD - curB * curC;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  const cx = width * 0.5;
  const cy = height * 0.5;
  const unit = Math.min(width, height) * 0.16;

  ctx.save();
  // Transform grid lines
  ctx.lineWidth = 1;
  for (let i = -5; i <= 5; i++) {
    // Transformed vertical line x = i
    const p1x = cx + (curA * i + curB * -5) * unit;
    const p1y = cy - (curC * i + curD * -5) * unit;
    const p2x = cx + (curA * i + curB * 5) * unit;
    const p2y = cy - (curC * i + curD * 5) * unit;
    ctx.strokeStyle = i === 0 ? '#475569' : 'rgba(71, 85, 105, 0.35)';
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.stroke();

    // Transformed horizontal line y = i
    const h1x = cx + (curA * -5 + curB * i) * unit;
    const h1y = cy - (curC * -5 + curD * i) * unit;
    const h2x = cx + (curA * 5 + curB * i) * unit;
    const h2y = cy - (curC * 5 + curD * i) * unit;
    ctx.beginPath();
    ctx.moveTo(h1x, h1y);
    ctx.lineTo(h2x, h2y);
    ctx.stroke();
  }

  // Draw transformed unit square
  const sq0x = cx;
  const sq0y = cy;
  const sq1x = cx + curA * unit;
  const sq1y = cy - curC * unit;
  const sq2x = cx + (curA + curB) * unit;
  const sq2y = cy - (curC + curD) * unit;
  const sq3x = cx + curB * unit;
  const sq3y = cy - curD * unit;

  ctx.fillStyle = det >= 0 ? 'rgba(56, 189, 248, 0.25)' : 'rgba(239, 68, 68, 0.25)';
  ctx.beginPath();
  ctx.moveTo(sq0x, sq0y);
  ctx.lineTo(sq1x, sq1y);
  ctx.lineTo(sq2x, sq2y);
  ctx.lineTo(sq3x, sq3y);
  ctx.closePath();
  ctx.fill();

  // Basis vector i-hat (1, 0) -> (curA, curC)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(sq1x, sq1y);
  ctx.stroke();

  // Basis vector j-hat (0, 1) -> (curB, curD)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(sq3x, sq3y);
  ctx.stroke();

  // Telemetry
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(`Matriz A = [ [${curA.toFixed(2)}, ${curB.toFixed(2)}], [${curC.toFixed(2)}, ${curD.toFixed(2)}] ]`, 24, 30);
  ctx.fillText(`det(A) = ad - bc = ${det.toFixed(2)} (Factor de escala de área)`, 24, 52);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`î transformado = (${curA.toFixed(2)}, ${curC.toFixed(2)})`, 24, 74);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`ĵ transformado = (${curB.toFixed(2)}, ${curD.toFixed(2)})`, 24, 94);

  ctx.restore();
}

// 4. Physics Projectile Motion with Aerodynamic Drag
export function renderProjectile(rc: RenderContext) {
  const { ctx, width, height, time, params } = rc;
  const angleDeg = params.angleDeg ?? 45;
  const v0 = params.velocity ?? 42;
  const g = params.gravity ?? 9.81;
  const dragCoeff = params.airResistance ?? 0.04;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, width, height, 40);

  const originX = width * 0.1;
  const groundY = height * 0.82;
  const scale = width * 0.0055;

  const theta = (angleDeg * Math.PI) / 180;
  const vx0 = v0 * Math.cos(theta);
  const vy0 = v0 * Math.sin(theta);

  // Ideal vacuum trajectory
  const tFlightVacuum = (2 * vy0) / g;
  ctx.save();
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 2;
  for (let t = 0; t <= tFlightVacuum; t += 0.05) {
    const x = originX + vx0 * t * scale;
    const y = groundY - (vy0 * t - 0.5 * g * t * t) * scale;
    if (t === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Numerical trajectory with drag: dv/dt = -g*j - drag*|v|*v
  const dt = 0.02;
  let currX = 0;
  let currY = 0;
  let currVx = vx0;
  let currVy = vy0;
  const dragPath: { x: number; y: number; vx: number; vy: number; t: number }[] = [];

  for (let simT = 0; simT < 12; simT += dt) {
    dragPath.push({ x: currX, y: currY, vx: currVx, vy: currVy, t: simT });
    const speed = Math.sqrt(currVx * currVx + currVy * currVy);
    const ax = -dragCoeff * speed * currVx;
    const ay = -g - dragCoeff * speed * currVy;

    currX += currVx * dt;
    currY += currVy * dt;
    currVx += ax * dt;
    currVy += ay * dt;

    if (currY < 0 && simT > 0.1) break;
  }

  // Draw real drag trajectory
  ctx.beginPath();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(245, 158, 11, 0.6)';
  ctx.shadowBlur = 8;
  dragPath.forEach((pt, idx) => {
    const px = originX + pt.x * scale;
    const py = groundY - pt.y * scale;
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Ground line
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(originX - 20, groundY);
  ctx.lineTo(width * 0.95, groundY);
  ctx.stroke();

  // Find projectile current position along cycle
  const maxT = dragPath[dragPath.length - 1]?.t || 3;
  const cycleTime = time % (maxT + 1.2);
  const activePt = dragPath.find((pt) => pt.t >= cycleTime) || dragPath[dragPath.length - 1];

  if (activePt && cycleTime <= maxT) {
    const ballX = originX + activePt.x * scale;
    const ballY = groundY - activePt.y * scale;

    // Glowing projectile ball
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(ballX, ballY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Velocity vector arrows
    const vScale = 1.2;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);
    ctx.lineTo(ballX + activePt.vx * vScale, ballY - activePt.vy * vScale);
    ctx.stroke();

    // Vx and Vy components
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ballX, ballY);
    ctx.lineTo(ballX + activePt.vx * vScale, ballY);
    ctx.lineTo(ballX + activePt.vx * vScale, ballY - activePt.vy * vScale);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Telemetry readout
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText(`Ángulo θ = ${angleDeg.toFixed(1)}° | v₀ = ${v0.toFixed(1)} m/s | g = ${g.toFixed(2)} m/s²`, 24, 30);
  ctx.fillText(`Arrastre Aerodinámico c = ${dragCoeff.toFixed(3)}`, 24, 52);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`-- Vacío ideal: Alcance R = ${((v0 * v0 * Math.sin(2 * theta)) / g).toFixed(1)} m`, 24, 74);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`— Con resistencia: Alcance Real = ${(dragPath[dragPath.length - 1]?.x || 0).toFixed(1)} m`, 24, 94);

  ctx.restore();
}

// 5. Physics Orbital Mechanics & Kepler's Laws
export function renderOrbital(rc: RenderContext) {
  const { ctx, width, height, time } = rc;
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  const cx = width * 0.46;
  const cy = height * 0.5;
  const a = Math.min(width, height) * 0.36; // Semi-major axis
  const e = 0.52; // Eccentricity
  const b = a * Math.sqrt(1 - e * e); // Semi-minor axis
  const c = a * e; // Focus offset (Sun position)
  const sunX = cx - c;
  const sunY = cy;

  ctx.save();
  // Orbit ellipse path
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Equal areas in equal times (Kepler's 2nd Law) sector slice
  const orbitPeriod = 8;
  const meanAnomaly = ((time % orbitPeriod) / orbitPeriod) * Math.PI * 2;
  // Kepler equation approximation: E ~ M + e*sin(M)
  const E = meanAnomaly + e * Math.sin(meanAnomaly);
  const px = cx + a * Math.cos(E);
  const py = cy + b * Math.sin(E);

  // Sector sweep triangle
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.beginPath();
  ctx.moveTo(sunX, sunY);
  ctx.lineTo(px, py);
  ctx.lineTo(cx + a * Math.cos(E - 0.35), cy + b * Math.sin(E - 0.35));
  ctx.closePath();
  ctx.fill();

  // Radius vector r(t)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(sunX, sunY);
  ctx.lineTo(px, py);
  ctx.stroke();

  // Central Star (Sun) with coronal glow
  const gradient = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, 32);
  gradient.addColorStop(0, '#fef08a');
  gradient.addColorStop(0.4, '#eab308');
  gradient.addColorStop(1, 'transparent');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 9, 0, Math.PI * 2);
  ctx.fill();

  // Orbiting Satellite / Planet
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(px, py, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Tangential velocity vector v
  const vx = -a * Math.sin(E);
  const vy = b * Math.cos(E);
  const vMag = Math.sqrt(vx * vx + vy * vy);
  const vScale = 38 / (vMag || 1);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(px + vx * vScale, py + vy * vScale);
  ctx.stroke();

  // Telemetry
  const distToSun = Math.sqrt((px - sunX) ** 2 + (py - sunY) ** 2);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('Leyes de Kepler & Gravitación Universal: F = G(M·m)/r²', 24, 30);
  ctx.fillText(`2ª Ley: dA/dt = const (Velocidad areolar constante)`, 24, 52);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Distancia al foco r = ${(distToSun / 10).toFixed(1)} UA | Velocidad orbital v ~ 1/r`, 24, 74);

  ctx.restore();
}

// 6. Physics Wave Interference & Diffraction
export function renderWaveInterference(rc: RenderContext) {
  const { ctx, width, height, time, params } = rc;
  const wavelength = params.wavelength ?? 28;
  const slitDist = params.slitDistance ?? 60;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  const slitX = width * 0.28;
  const slit1Y = height * 0.5 - slitDist * 0.5;
  const slit2Y = height * 0.5 + slitDist * 0.5;
  const screenX = width * 0.82;

  ctx.save();
  // Draw wave pulses from slits
  const numRings = 14;
  for (let r = 0; r < numRings; r++) {
    const radius = ((time * 30 + r * wavelength) % (screenX - slitX));
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 - (radius / (screenX - slitX)) * 0.35})`;
    ctx.lineWidth = 1.5;

    // From slit 1
    ctx.beginPath();
    ctx.arc(slitX, slit1Y, radius, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // From slit 2
    ctx.beginPath();
    ctx.arc(slitX, slit2Y, radius, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();
  }

  // Double slit barrier
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(slitX, 0);
  ctx.lineTo(slitX, slit1Y - 8);
  ctx.moveTo(slitX, slit1Y + 8);
  ctx.lineTo(slitX, slit2Y - 8);
  ctx.moveTo(slitX, slit2Y + 8);
  ctx.lineTo(slitX, height);
  ctx.stroke();

  // Screen line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(screenX, 20);
  ctx.lineTo(screenX, height - 20);
  ctx.stroke();

  // Intensity fringe pattern on detection screen
  const k = (2 * Math.PI) / wavelength;
  const L = screenX - slitX;
  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
  ctx.shadowBlur = 8;

  for (let y = 30; y < height - 30; y += 2) {
    const yRel = y - height * 0.5;
    const sinTheta = yRel / Math.sqrt(L * L + yRel * yRel);
    const delta = (k * slitDist * sinTheta) / 2;
    const intensity = Math.cos(delta) ** 2; // I = I0 * cos^2(delta)
    const barW = intensity * 70;

    const px = screenX + barW;
    if (y === 30) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Telemetry
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('Experimento de la Doble Rendija de Young: d·sin(θ) = m·λ', 24, 30);
  ctx.fillText(`Separación d = ${slitDist} px | Longitud de onda λ = ${wavelength} px`, 24, 52);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('Perfil de Intensidad: I(θ) = I₀ cos²(π d sinθ / λ)', screenX - 60, height - 12);

  ctx.restore();
}

// 7. Physics Electromagnetism Field Lines
export function renderElectromagnetism(rc: RenderContext) {
  const { ctx, width, height, time, params } = rc;
  const q1 = params.chargeQ1 ?? 1;
  const q2 = params.chargeQ2 ?? -1;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  const cx = width * 0.5;
  const cy = height * 0.5;
  const dist = Math.min(width, height) * 0.22;
  const p1x = cx - dist;
  const p1y = cy;
  const p2x = cx + dist;
  const p2y = cy;

  ctx.save();
  // Draw field lines numerically
  const numLines = 16;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.4;

  for (let i = 0; i < numLines; i++) {
    const angle = (i / numLines) * Math.PI * 2;
    let rx = p1x + 12 * Math.cos(angle);
    let ry = p1y + 12 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(rx, ry);

    for (let step = 0; step < 120; step++) {
      const r1Sq = (rx - p1x) ** 2 + (ry - p1y) ** 2 + 10;
      const r2Sq = (rx - p2x) ** 2 + (ry - p2y) ** 2 + 10;
      const r1 = Math.sqrt(r1Sq);
      const r2 = Math.sqrt(r2Sq);

      const ex = (q1 * (rx - p1x)) / (r1 * r1Sq) + (q2 * (rx - p2x)) / (r2 * r2Sq);
      const ey = (q1 * (ry - p1y)) / (r1 * r1Sq) + (q2 * (ry - p2y)) / (r2 * r2Sq);
      const eMag = Math.sqrt(ex * ex + ey * ey);

      if (eMag < 0.0001) break;
      rx += (ex / eMag) * 4;
      ry += (ey / eMag) * 4;

      ctx.lineTo(rx, ry);
      if (Math.hypot(rx - p2x, ry - p2y) < 14) break;
      if (rx < 0 || rx > width || ry < 0 || ry > height) break;
    }
    ctx.stroke();
  }

  // Charge 1 (Positive)
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(p1x, p1y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('+', p1x - 5, p1y + 5);

  // Charge 2 (Negative)
  ctx.fillStyle = '#0284c7';
  ctx.shadowColor = '#0284c7';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(p2x, p2y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('−', p2x - 4, p2y + 5);

  // Moving test charge
  const tOrb = (time * 0.8) % (Math.PI * 2);
  const testX = cx + Math.sin(tOrb) * (dist * 0.7);
  const testY = cy + Math.cos(tOrb * 2) * (dist * 0.4);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(testX, testY, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('Ley de Coulomb & Campo Electrostático: E = (1/4πε₀) · q / r²', 24, 30);
  ctx.fillText('Líneas de fuerza emergen de cargas positivas y convergen en negativas', 24, 52);

  ctx.restore();
}

// 8. Engineering Beam Shear & Bending Moment Diagrams
export function renderBeam(rc: RenderContext) {
  const { ctx, width, height, params } = rc;
  const L = params.beamLength ?? 8; // meters
  const P = params.pointLoad ?? 40; // kN
  const a = params.loadPosition ?? 3.5; // position of load

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  const startX = width * 0.15;
  const beamWidth = width * 0.7;
  const scaleX = beamWidth / L;

  const beamY = height * 0.22;
  const vDiagramY = height * 0.52;
  const mDiagramY = height * 0.82;

  // Support reactions: R1 = P*(L-a)/L, R2 = P*a/L
  const R1 = (P * (L - a)) / L;
  const R2 = (P * a) / L;
  const maxM = (P * a * (L - a)) / L;

  ctx.save();
  // 1. Physical Beam
  ctx.fillStyle = '#334155';
  ctx.fillRect(startX, beamY - 8, beamWidth, 16);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, beamY - 8, beamWidth, 16);

  // Supports (Pin at A, Roller at B)
  ctx.fillStyle = '#0ea5e9';
  // Pin support
  ctx.beginPath();
  ctx.moveTo(startX, beamY + 8);
  ctx.lineTo(startX - 12, beamY + 26);
  ctx.lineTo(startX + 12, beamY + 26);
  ctx.closePath();
  ctx.fill();

  // Roller support
  ctx.beginPath();
  ctx.arc(startX + beamWidth, beamY + 16, 8, 0, Math.PI * 2);
  ctx.fill();

  // Load vector P
  const loadX = startX + a * scaleX;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(loadX, beamY - 45);
  ctx.lineTo(loadX, beamY - 8);
  ctx.stroke();
  // Arrowhead
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(loadX, beamY - 8);
  ctx.lineTo(loadX - 6, beamY - 18);
  ctx.lineTo(loadX + 6, beamY - 18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.fillText(`P = ${P.toFixed(0)} kN`, loadX + 10, beamY - 25);
  ctx.fillText(`R₁ = ${R1.toFixed(1)} kN`, startX - 25, beamY + 42);
  ctx.fillText(`R₂ = ${R2.toFixed(1)} kN`, startX + beamWidth - 25, beamY + 42);

  // 2. Shear Force Diagram V(x)
  ctx.strokeStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(startX, vDiagramY);
  ctx.lineTo(startX + beamWidth, vDiagramY);
  ctx.stroke();

  const vScale = 35 / (P || 1);
  ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
  ctx.beginPath();
  ctx.moveTo(startX, vDiagramY);
  ctx.lineTo(startX, vDiagramY - R1 * vScale);
  ctx.lineTo(loadX, vDiagramY - R1 * vScale);
  ctx.lineTo(loadX, vDiagramY + R2 * vScale);
  ctx.lineTo(startX + beamWidth, vDiagramY + R2 * vScale);
  ctx.lineTo(startX + beamWidth, vDiagramY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Diagrama de Cortante V(x)`, startX, vDiagramY - 42);
  ctx.fillText(`+${R1.toFixed(1)} kN`, startX + 10, vDiagramY - R1 * vScale - 5);
  ctx.fillText(`-${R2.toFixed(1)} kN`, loadX + 10, vDiagramY + R2 * vScale + 14);

  // 3. Bending Moment Diagram M(x)
  ctx.strokeStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(startX, mDiagramY);
  ctx.lineTo(startX + beamWidth, mDiagramY);
  ctx.stroke();

  const mScale = 45 / (maxM || 1);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.beginPath();
  ctx.moveTo(startX, mDiagramY);
  ctx.lineTo(loadX, mDiagramY - maxM * mScale);
  ctx.lineTo(startX + beamWidth, mDiagramY);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Diagrama de Momento Flector M(x)`, startX, mDiagramY - 45);
  ctx.fillText(`M_máx = ${maxM.toFixed(1)} kN·m`, loadX + 8, mDiagramY - maxM * mScale - 6);

  ctx.restore();
}

// 9. Engineering RLC Circuit Transient Dynamics
export function renderCircuitRLC(rc: RenderContext) {
  const { ctx, width, height, time, params } = rc;
  const R = params.damping ?? 30; // Ohms
  const L = params.inductance ?? 0.2; // Henries
  const C = params.capacitance ?? 0.0001; // Farads

  const omega0 = 1 / Math.sqrt(L * C);
  const alpha = R / (2 * L);
  const zeta = alpha / omega0;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, width, height, 40);

  const startX = width * 0.12;
  const originY = height * 0.55;
  const graphWidth = width * 0.78;
  const vScale = height * 0.28;

  ctx.save();
  // Axis
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX, originY);
  ctx.lineTo(startX + graphWidth, originY);
  ctx.moveTo(startX, originY - vScale - 20);
  ctx.lineTo(startX, originY + vScale + 20);
  ctx.stroke();

  // Step response V_in = 1V
  ctx.strokeStyle = 'rgba(234, 179, 8, 0.5)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(startX, originY - vScale);
  ctx.lineTo(startX + graphWidth, originY - vScale);
  ctx.stroke();
  ctx.setLineDash([]);

  // Plot voltage across capacitor v_C(t)
  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.shadowColor = 'rgba(56, 189, 248, 0.5)';
  ctx.shadowBlur = 8;

  const totalSimTime = 0.08; // 80 ms
  const points = 300;

  for (let i = 0; i < points; i++) {
    const t = (i / points) * totalSimTime;
    let vC = 0;

    if (zeta < 1) {
      // Underdamped oscillation
      const wd = omega0 * Math.sqrt(1 - zeta * zeta);
      vC = 1 - Math.exp(-alpha * t) * (Math.cos(wd * t) + (alpha / wd) * Math.sin(wd * t));
    } else {
      // Overdamped
      vC = 1 - Math.exp(-alpha * t);
    }

    const px = startX + (i / points) * graphWidth;
    const py = originY - vC * vScale;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Active time cursor
  const cursorT = (time * 0.02) % totalSimTime;
  const cursorX = startX + (cursorT / totalSimTime) * graphWidth;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cursorX, originY - vScale - 10);
  ctx.lineTo(cursorX, originY + vScale + 10);
  ctx.stroke();

  // Telemetry
  ctx.fillStyle = '#f8fafc';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('Dinámica Transitoria Circuito RLC Serie: L·(d²q/dt²) + R·(dq/dt) + q/C = V_in', 24, 30);
  ctx.fillText(`Frecuencia Natural ω₀ = ${omega0.toFixed(0)} rad/s | Coeficiente Amortiguamiento ζ = ${zeta.toFixed(2)}`, 24, 52);
  ctx.fillStyle = zeta < 1 ? '#38bdf8' : '#eab308';
  ctx.fillText(`Régimen: ${zeta < 1 ? 'Subamortiguado (Oscilatorio transitorio)' : 'Sobreamortiguado'}`, 24, 74);

  ctx.restore();
}

// 10. Engineering Thermodynamics Carnot Cycle
export function renderCarnot(rc: RenderContext) {
  const { ctx, width, height, time } = rc;
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);
  drawGrid(ctx, width, height, 40);

  const startX = width * 0.16;
  const originY = height * 0.8;
  const scaleV = width * 0.65;
  const scaleP = height * 0.6;

  // 4 States of Carnot cycle
  const v1 = 0.15;
  const p1 = 0.85;
  const v2 = 0.45;
  const p2 = 0.55;
  const v3 = 0.85;
  const p3 = 0.22;
  const v4 = 0.38;
  const p4 = 0.38;

  ctx.save();
  // Draw enclosed work area
  ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
  ctx.beginPath();
  ctx.moveTo(startX + v1 * scaleV, originY - p1 * scaleP);
  // Isothermal expansion 1->2
  ctx.quadraticCurveTo(startX + 0.3 * scaleV, originY - 0.7 * scaleP, startX + v2 * scaleV, originY - p2 * scaleP);
  // Adiabatic expansion 2->3
  ctx.quadraticCurveTo(startX + 0.65 * scaleV, originY - 0.35 * scaleP, startX + v3 * scaleV, originY - p3 * scaleP);
  // Isothermal compression 3->4
  ctx.quadraticCurveTo(startX + 0.6 * scaleV, originY - 0.3 * scaleP, startX + v4 * scaleV, originY - p4 * scaleP);
  // Adiabatic compression 4->1
  ctx.quadraticCurveTo(startX + 0.22 * scaleV, originY - 0.6 * scaleP, startX + v1 * scaleV, originY - p1 * scaleP);
  ctx.closePath();
  ctx.fill();

  // Cycle border
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // State points
  const states = [
    { name: '1', v: v1, p: p1, label: 'T_H' },
    { name: '2', v: v2, p: p2, label: 'T_H → T_C' },
    { name: '3', v: v3, p: p3, label: 'T_C' },
    { name: '4', v: v4, p: p4, label: 'T_C → T_H' },
  ];

  ctx.fillStyle = '#38bdf8';
  states.forEach((s) => {
    const sx = startX + s.v * scaleV;
    const sy = originY - s.p * scaleP;
    ctx.beginPath();
    ctx.arc(sx, sy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(`Estado ${s.name} (${s.label})`, sx + 8, sy - 4);
    ctx.fillStyle = '#38bdf8';
  });

  // Operating tracer
  const stage = (time * 0.6) % 4;
  const stageIdx = Math.floor(stage);
  const sProgress = stage - stageIdx;
  const sCurrent = states[stageIdx];
  const sNext = states[(stageIdx + 1) % 4];
  const tracerX = startX + (sCurrent.v + (sNext.v - sCurrent.v) * sProgress) * scaleV;
  const tracerY = originY - (sCurrent.p + (sNext.p - sCurrent.p) * sProgress) * scaleP;

  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(tracerX, tracerY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Axes
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(startX - 10, originY);
  ctx.lineTo(startX + scaleV + 30, originY);
  ctx.moveTo(startX, originY + 10);
  ctx.lineTo(startX, originY - scaleP - 30);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px "JetBrains Mono", monospace';
  ctx.fillText('Presión P', startX + 10, originY - scaleP - 15);
  ctx.fillText('Volumen V', startX + scaleV - 10, originY + 25);

  ctx.fillStyle = '#f8fafc';
  ctx.fillText('Ciclo de Carnot en Diagrama P-V: Trabajo Neto W_net = ∮ P dV', 24, 30);
  ctx.fillText('Rendimiento Máximo Teórico: η_Carnot = 1 - (T_C / T_H)', 24, 52);

  ctx.restore();
}

// Master dispatcher
export function renderSimulationByType(visualType: string, rc: RenderContext) {
  switch (visualType) {
    case 'math_fourier':
      renderFourier(rc);
      break;
    case 'math_riemann':
      renderRiemann(rc);
      break;
    case 'math_matrix':
      renderMatrixTransform(rc);
      break;
    case 'physics_projectile':
      renderProjectile(rc);
      break;
    case 'physics_orbital':
      renderOrbital(rc);
      break;
    case 'physics_wave':
      renderWaveInterference(rc);
      break;
    case 'physics_electromagnetism':
      renderElectromagnetism(rc);
      break;
    case 'eng_beam':
      renderBeam(rc);
      break;
    case 'eng_circuit_rlc':
      renderCircuitRLC(rc);
      break;
    case 'eng_thermo_carnot':
      renderCarnot(rc);
      break;
    default:
      // Default to Fourier or Projectile
      renderFourier(rc);
      break;
  }
}
