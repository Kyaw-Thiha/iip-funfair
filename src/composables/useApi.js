import useSupabase from 'src/boot/supabase';
import UseAuthUser from 'src/composables/useAuthUser';
import { v4 as uuidv4 } from 'uuid';

export default function useApi() {
  const { supabase } = useSupabase();
  const { user } = UseAuthUser();

  /**
   * Retorna todos dos dados disponiveis na tabela passada como parâmetro.
   */
  const list = async (table) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) throw error;
    return data;
  };

  /**
   * Retorna uma tupla da tabela passada como parâmetro
   * de acordo com o id, também passado como parêmtro.
   */
  const getById = async (table, id, fields = '*') => {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .eq('id', id);
    if (error) throw error;
    return data[0];
    /**
     * como a busca é por id, caso encontre, basta se retorne o primeiro elemento.
     */
  };

  /**
   * Retorna uma tupla da tabela passada como parâmetro
   * de acordo com o id, também passado como parêmtro.
   */
  const filterByProperties = async (table, filter, fields = '*') => {
    const { data, error } = await supabase
      .from(table)
      .select(fields)
      .match(filter);

    if (error) throw error;
    return data;
    /**
     * como a busca é por id, caso encontre, basta se retorne o primeiro elemento.
     */
  };

  /**
   * Retorna uma tupla da tabela passada como parâmetro
   * de acordo com o id, também passado como parêmtro.
   */
  const filterAndCount = async (table, filter, fields = '*') => {
    const { count, error } = await supabase
      .from(table)
      .select(fields, { count: 'exact', head: true })
      .match(filter);

    if (error) throw error;
    return count;
    /**
     * como a busca é por id, caso encontre, basta se retorne o primeiro elemento.
     */
  };

  /**
   * Adiciona uma tupla populada na tabela passada como parâmetro
   * usando os dados do formulário passado como parâmetro.
   */
  const post = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .insert([
        {
          ...form, // todos os parâmetros do form
          //user_id: user.value.id,
        },
      ])
      .select();
    if (error) throw error;
    return data;
  };

  /**
   * Atualiza uma tupla na tabela passada como parâmetro
   * usando os dados do formulário passado como parâmetro.
   */
  const update = async (table, form) => {
    const { data, error } = await supabase
      .from(table)
      .update({
        ...form,
      })
      .eq('id', form.id);
    //.match({ id: form.id }); // same as "where t.id = form.id"
    if (error) throw error;
    return data;
  };

  /**
   * Remove/Deleta uma tupla na tabela passada como parâmetro
   * usando o id passado como parâmetro.
   */
  const remove = async (table, id) => {
    const { data, error } = await supabase.from(table).delete().match({ id });
    if (error) throw error;
    return data[0];
  };

  /**
   *
   */

  const uploadImg = async (file, storage, fileName = uuidv4()) => {
    //const fileName = uuidv4();

    const { error } = supabase.storage.from(storage).upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });
    //const publicUrl = await getUrlPublic(fileName, storage);
    if (error) throw error;
    return fileName;
  };

  /**
   *
   */

  const deleteImg = async (storage, fileName) => {
    const { error } = supabase.storage.from(storage).remove([fileName]);
    if (error) throw error;
    return fileName;
  };

  /**
   *
   */

  const getUrlPublic = async (fileName, storage) => {
    const { publicURL } = supabase.storage.from(storage).getPublicUrl(fileName);
    //if (error) throw error;
    return publicURL;
  };

  return {
    list,
    getById,
    filterByProperties,
    filterAndCount,
    post,
    update,
    remove,
    uploadImg,
    deleteImg,
    getUrlPublic,
  };
}
