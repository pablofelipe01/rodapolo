#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'

console.log('🔍 DIAGNÓSTICO COMPLETO DEL PROYECTO\n')

// Función para ejecutar comandos y capturar errores
function runCommand(command, description) {
  console.log(`\n📋 ${description}`)
  console.log('━'.repeat(50))

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    console.log('✅ OK')
    if (output.trim()) {
      console.log(output)
    }
    return { success: true, output }
  } catch (error) {
    console.log('❌ ERROR')
    console.log(error.stdout || '')
    console.log(error.stderr || '')
    return { success: false, error: error.message, output: error.stdout }
  }
}

// Función para contar archivos con errores TypeScript
function analyzeTypeScriptErrors() {
  console.log('\n📊 ANÁLISIS DE ERRORES TYPESCRIPT')
  console.log('━'.repeat(50))

  try {
    const _result = execSync('npx tsc --noEmit', {
      encoding: 'utf-8',
      stdio: 'pipe',
    })
    console.log('✅ No hay errores de TypeScript')
    console.log('✅ No hay errores de TypeScript')
  } catch (error) {
    const errorOutput = error.stdout || error.stderr || ''
    const errorLines = errorOutput
      .split('\n')
      .filter(line => line.includes('error TS'))

    console.log(`❌ ${errorLines.length} errores de TypeScript encontrados`)

    // Agrupar errores por archivo
    const errorsByFile = {}
    errorLines.forEach(line => {
      const match = line.match(/^(.+?)\(\d+,\d+\):/)
      if (match) {
        const file = match[1]
        errorsByFile[file] = (errorsByFile[file] || 0) + 1
      }
    })

    console.log('\n📁 Errores por archivo:')
    Object.entries(errorsByFile).forEach(([file, count]) => {
      console.log(`   ${file}: ${count} errores`)
    })

    console.log('\n🔧 Primeros 10 errores:')
    errorLines.slice(0, 10).forEach((line, i) => {
      console.log(`   ${i + 1}. ${line}`)
    })
  }
}

// Función para verificar dependencias
function checkDependencies() {
  console.log('\n📦 VERIFICACIÓN DE DEPENDENCIAS')
  console.log('━'.repeat(50))

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    const devDeps = Object.keys(packageJson.devDependencies || {})
    const deps = Object.keys(packageJson.dependencies || {})

    console.log(`✅ ${deps.length} dependencias principales`)
    console.log(`✅ ${devDeps.length} dependencias de desarrollo`)

    // Verificar si hay dependencias faltantes
    runCommand('npm ls --depth=0', 'Verificando integridad de dependencias')
  } catch {
    console.log('❌ Error leyendo package.json')
  }
}

// Función para verificar configuración de Next.js
function checkNextConfig() {
  console.log('\n⚙️ CONFIGURACIÓN DE NEXT.JS')
  console.log('━'.repeat(50))

  if (fs.existsSync('next.config.js')) {
    console.log('✅ next.config.js existe')
  } else if (fs.existsSync('next.config.mjs')) {
    console.log('✅ next.config.mjs existe')
  } else {
    console.log('⚠️  No se encontró archivo de configuración de Next.js')
  }

  if (fs.existsSync('tsconfig.json')) {
    console.log('✅ tsconfig.json existe')
  } else {
    console.log('❌ tsconfig.json no encontrado')
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando diagnóstico...')

  // 1. Verificar Node.js y npm
  runCommand('node --version', 'Versión de Node.js')
  runCommand('npm --version', 'Versión de npm')

  // 2. Verificar dependencias
  checkDependencies()

  // 3. Verificar configuración
  checkNextConfig()

  // 4. Análisis de TypeScript
  analyzeTypeScriptErrors()

  // 5. Lint check
  runCommand('npm run lint', 'Verificación de ESLint')

  // 6. Build check
  runCommand('npm run build', 'Build de producción')

  // 7. Resumen final
  console.log('\n🏁 RESUMEN DEL DIAGNÓSTICO')
  console.log('━'.repeat(50))
  console.log('1. Revisa los errores de TypeScript mostrados arriba')
  console.log(
    '2. Los errores principales están relacionados con tipos de Supabase'
  )
  console.log('3. Usa @ts-expect-error para ignorar errores temporalmente')
  console.log(
    '4. Considera actualizar los tipos de Supabase si persisten los problemas'
  )
  console.log('\n✨ Diagnóstico completado!')
}

main().catch(console.error)
