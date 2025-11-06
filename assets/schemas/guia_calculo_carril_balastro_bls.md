
# Guia de Cálculo — CARRIL, BALASTRO, FIXAÇÕES E FLECHAS (por descrições)

Este guia resume as fórmulas utilizadas no ficheiro **CALCULO DE CARRIL_BALASTRO_BLS.xlsx**, explicando cada caso com base nas descrições e dependências lógicas — sem referência a células. Pode ser seguido manualmente para validar os resultados de cada folha.

---

## 1. CARRIL (Barras de 108 m, 60 m ou outro comprimento)

### Variáveis
- **L** — comprimento total de via a equipar (m)  
- **k** — comprimento padrão de cada barra (m) — pode ser **108 m**, **60 m**, **36 m**, etc.  
- **z** — massa linear do carril (kg/m), p.ex. **54,77 kg/m** (perfil 54E1)  
- **p** — perda média por barra (m), se existir (ex.: 0,3 m)  
- **x** — número de barras necessárias  
- **Lₑ** — comprimento efetivo fornecido  
- **ΔL** — diferença (sobra ou falta)  
- **y** — massa total de carril (t)

### Cálculos
1. **Número de barras**  
   - Sem perdas: `x = teto(L / k)`  
   - Com perdas: `x = teto(L / (k - p))`

2. **Comprimento efetivo fornecido**  
   - `Lₑ = x · k`

3. **Sobra técnica (ou falta)**  
   - `ΔL = Lₑ − L`

4. **Massa total de carril**  
   - Se calculares pelo comprimento exato: `y = (L · z) / 1000`  
   - Se calculares por barras inteiras: `y = (x · k · z) / 1000`

> **Exemplo prático**:  
> L = 1 250 m, k = 108 m, z = 54,77 kg/m  
> x = 12 barras → Lₑ = 1 296 m → ΔL = +46 m → y = 71,07 t (barras inteiras)

---

## 2. BALASTRO

### Variáveis
- **L** — comprimento total de via (m)  
- **A** — área da secção transversal do balastro (m²)  
- **ρ** — densidade do balastro (t/m³)  
- **V** — volume total (m³)  
- **y** — massa total (t)

### Cálculos
1. Volume total: `V = A · L`  
2. Massa total: `y = V · ρ`

> Se a densidade for em kg/m³, divide por 1000 para obter toneladas.

---

## 3. FIXAÇÕES (TRAVESSAS, PONTES, etc.)

### Variáveis
- **L** — comprimento total de via ou ponte (m)  
- **e** — espaçamento entre fixações (m)  
- **x** — número de fixações

### Cálculo
- `x = teto(L / e)`

> Exemplo: L = 216 m, e = 0,6 m → x = 360 fixações.

---

## 4. FLECHAS E RAIOS (verificação estrutural ou geométrica)

### Variáveis
- **R** — raio da curva (m)  
- **L** — vão ou comprimento entre apoios (m)  
- **E** — superelevação (mm)  
- **F_adm** — flecha admissível (mm)  
- **F_calc** — flecha calculada (mm)

### Cálculos típicos
1. Determinação da flecha teórica (depende do tipo de viga):  
   - Simplesmente apoiada: `F_calc = (5 · q · L⁴) / (384 · E · I)`  
   - Engastada nas extremidades: `F_calc = (q · L⁴) / (384 · E · I)`

2. Verificação:  
   - Se `F_calc ≤ F_adm` → **Cumpre**  
   - Caso contrário → **Não cumpre**

---

## 5. BLS (Resumo / Consolidação)

A folha BLS normalmente agrega resultados das anteriores:
- Importa massas e comprimentos do **Carril** e do **Balastro**  
- Soma totais e calcula valores médios (ex.: massa total de carril + balastro por segmento)  
- Pode gerar totais finais por tipo de via ou troço.

Cálculos genéricos:
1. `M_total = M_carril + M_balastro + M_fixações`  
2. `Peso_médio_por_metro = M_total / L`

---

## 6. ESCALAS / CONSTANTES

Esta folha contém fatores de conversão e unidades auxiliares:
- mm ↔ m, kg ↔ t, N ↔ kN, etc.  
- Todos os cálculos anteriores dependem destes fatores de escala.  
- Usa-os sempre como multiplicadores simples.

---

## 7. PNs (Pequenos cálculos complementares)

Fórmulas auxiliares de verificação ou contagem:
- Somas, médias ou ajustes finais de valores.  
- Normalmente servem para gerar números redondos de projeto.

---

### Síntese geral de dependências

| Cálculo | Depende de | Produz |
|----------|-------------|--------|
| **Carril** | L, k, z | nº barras (x), massa total (y) |
| **Balastro** | L, A, ρ | volume (V), massa (y) |
| **Fixações** | L, e | nº fixações (x) |
| **Flechas/Raios** | R, L, E, q, E, I | flecha calculada (F_calc) |
| **BLS** | resultados anteriores | totais e médias |
| **Escalas** | unidades-base | fatores de conversão |
| **PNs** | quaisquer variáveis intermédias | correções finais |

---

**Autor:** Análise automática da folha de cálculo  
**Objetivo:** permitir replicar manualmente todos os cálculos do ficheiro.
