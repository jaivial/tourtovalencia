#!/bin/bash

# Script para añadir exports de React a los bundles de vendor
# Este script se ejecuta después del build
# NOTA: Con el nuevo chunking automático de Vite, ya no se necesita este script

cd "$(dirname "$0")/.."

echo "ℹ️  El chunking automático de Vite está activo, no se necesitan exports manuales"

echo "✨ Proceso completado"
