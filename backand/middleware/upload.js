/**
 * Upload de imagens de referencia e plantas (RF 15).
 * Os arquivos ficam em memoria e depois sao enviados ao Supabase Storage
 * pelo model SolicitacaoAnexo.
 */
const multer = require('multer');

const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 }, // 5 MB por arquivo, ate 8 arquivos
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname));
  },
});

// Campos do formulario de solicitacao
const uploadAnexos = upload.fields([
  { name: 'referencias', maxCount: 6 },
  { name: 'planta', maxCount: 2 },
]);

module.exports = { uploadAnexos };
